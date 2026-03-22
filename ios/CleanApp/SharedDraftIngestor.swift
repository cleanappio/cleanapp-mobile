import Foundation

final class SharedDraftIngestor {
  private let store = SharedDraftStore()
  private let submitter = ShareSubmitter()

  func retryPendingDrafts(
    context: SharedDraftContext,
    completion: @escaping ([String: Int]) -> Void
  ) {
    DispatchQueue.global(qos: .utility).async {
      let drafts: [SharedIncomingReport]
      do {
        drafts = try self.store.loadPendingDrafts()
      } catch {
        NSLog("[ShareToCleanApp] share_retry_failed load_pending_drafts error=%@", String(describing: error))
        completion([
          "attempted": 0,
          "submitted": 0,
          "remaining": 0,
        ])
        return
      }

      guard !drafts.isEmpty else {
        completion([
          "attempted": 0,
          "submitted": 0,
          "remaining": 0,
        ])
        return
      }

      var submitted = 0
      let group = DispatchGroup()

      for draft in drafts {
        group.enter()
        NSLog("[ShareToCleanApp] share_retry_started id=%@", draft.id)
        self.submitter.submit(report: draft, context: context) { result in
          switch result {
          case .success:
            do {
              try self.store.removeDraft(id: draft.id, imagePath: draft.localImagePath)
              submitted += 1
              NSLog("[ShareToCleanApp] share_retry_succeeded id=%@", draft.id)
            } catch {
              NSLog("[ShareToCleanApp] share_retry_cleanup_failed id=%@ error=%@", draft.id, String(describing: error))
            }
          case let .failure(error):
            NSLog("[ShareToCleanApp] share_retry_failed id=%@ error=%@", draft.id, String(describing: error))
          }
          group.leave()
        }
      }

      group.wait()
      let remaining = (try? self.store.loadPendingDrafts().count) ?? 0
      completion([
        "attempted": drafts.count,
        "submitted": submitted,
        "remaining": remaining,
      ])
    }
  }
}
