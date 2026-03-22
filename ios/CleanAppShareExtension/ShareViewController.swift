import UIKit

final class ShareViewController: UIViewController {
  private let spinner = UIActivityIndicatorView(style: .large)
  private let checkmarkView = UIImageView(image: UIImage(systemName: "checkmark.circle.fill"))
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

    checkmarkView.translatesAutoresizingMaskIntoConstraints = false
    checkmarkView.tintColor = .systemGreen
    checkmarkView.preferredSymbolConfiguration = .init(pointSize: 64, weight: .bold)
    checkmarkView.alpha = 0
    view.addSubview(checkmarkView)

    NSLayoutConstraint.activate([
      spinner.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      spinner.centerYAnchor.constraint(equalTo: view.centerYAnchor),
      checkmarkView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      checkmarkView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
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
      case let .success(submission):
        NSLog("[ShareToCleanApp] share_submit_succeeded id=%@", report.id)
        self?.handleSuccess(report: report, submission: submission)
      case let .failure(error):
        NSLog("[ShareToCleanApp] share_submit_failed id=%@ error=%@", report.id, String(describing: error))
        self?.queue(report: report, error: error)
      }
    }
  }

  private func handleSuccess(report: SharedIncomingReport, submission: ShareSubmissionResult) {
    draftStore.recordSuccessfulSubmission(
      SharedSubmissionReceipt(
        shareID: report.id,
        reportID: submission.reportID,
        publicID: submission.publicID,
        receiptID: submission.receiptID
      )
    )

    DispatchQueue.main.async {
      self.spinner.stopAnimating()
      UIView.animate(withDuration: 0.15, animations: {
        self.checkmarkView.alpha = 1
        self.checkmarkView.transform = CGAffineTransform(scaleX: 1.08, y: 1.08)
      }, completion: { _ in
        UIView.animate(withDuration: 0.12, delay: 0.45, options: [.curveEaseInOut], animations: {
          self.checkmarkView.alpha = 0
          self.checkmarkView.transform = .identity
        }, completion: { _ in
          self.finish()
        })
      })
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
