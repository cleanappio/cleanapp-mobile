import UIKit

final class ShareViewController: UIViewController {
  private let spinner = UIActivityIndicatorView(style: .large)
  private let parser = ShareParser()
  private let submitter = ShareSubmitter()
  private let draftStore = SharedDraftStore()
  private var didStart = false

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .systemBackground
    spinner.translatesAutoresizingMaskIntoConstraints = false
    spinner.startAnimating()
    view.addSubview(spinner)
    NSLayoutConstraint.activate([
      spinner.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      spinner.centerYAnchor.constraint(equalTo: view.centerYAnchor),
    ])
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    guard !didStart else {
      return
    }
    didStart = true
    handleShare()
  }

  private func handleShare() {
    NSLog("[ShareToCleanApp] share_invoked platform=ios capture_mode=share_extension")
    guard let extensionContext else {
      finish()
      return
    }

    parser.parse(from: extensionContext) { [weak self] result in
      guard let self else {
        extensionContext.completeRequest(returningItems: nil)
        return
      }

      switch result {
      case let .success(report):
        NSLog("[ShareToCleanApp] share_payload_type type=%@", report.payloadType)
        self.submit(report: report)
      case let .failure(error):
        NSLog("[ShareToCleanApp] share_parse_failed error=%@", String(describing: error))
        self.finish()
      }
    }
  }

  private func submit(report: SharedIncomingReport) {
    NSLog("[ShareToCleanApp] share_submit_started id=%@", report.id)
    submitter.submit(report: report, context: ShareContextStore.shared.load(), timeout: 10) { [weak self] result in
      switch result {
      case .success:
        NSLog("[ShareToCleanApp] share_submit_succeeded id=%@", report.id)
        self?.finish()
      case let .failure(error):
        NSLog("[ShareToCleanApp] share_submit_failed id=%@ error=%@", report.id, String(describing: error))
        self?.queue(report: report, error: error)
      }
    }
  }

  private func queue(report: SharedIncomingReport, error: Error) {
    var draft = report
    draft.submissionState = .failed
    draft.failureReason = error.localizedDescription
    do {
      try draftStore.saveDraft(draft)
      NSLog("[ShareToCleanApp] share_queued_for_retry id=%@", report.id)
    } catch {
      NSLog("[ShareToCleanApp] share_queue_failed id=%@ error=%@", report.id, String(describing: error))
    }
    finish()
  }

  private func finish() {
    extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
  }
}
