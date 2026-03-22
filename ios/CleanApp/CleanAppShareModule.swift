import Foundation
import React

@objc(CleanAppShareModule)
class CleanAppShareModule: NSObject {
  private let ingestor = SharedDraftIngestor()

  @objc(syncShareContext:resolver:rejecter:)
  func syncShareContext(
    _ payload: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let context = SharedDraftContext(
      walletAddress: payload["walletAddress"] as? String,
      installID: payload["installId"] as? String,
      liveURL: (payload["liveUrl"] as? String) ?? CleanAppShareConstants.defaultLiveURL,
      appVersion: payload["appVersion"] as? String
    )

    do {
      try ShareContextStore.shared.save(context)
      resolve(true)
    } catch {
      reject("share_context_error", error.localizedDescription, error)
    }
  }

  @objc(retryPendingSharedDrafts:rejecter:)
  func retryPendingSharedDrafts(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let context = ShareContextStore.shared.load()
    ingestor.retryPendingDrafts(context: context) { stats in
      resolve(stats)
    }
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    false
  }
}
