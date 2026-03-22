import Foundation

enum CleanAppShareConstants {
  static let appGroupID = "group.io.cleanapp.shared"
  static let defaultLiveURL = "https://live.cleanapp.io"
}

final class ShareContextStore {
  static let shared = ShareContextStore()

  private let suite = UserDefaults(suiteName: CleanAppShareConstants.appGroupID)
  private let contextKey = "cleanapp.share_context"

  func load() -> SharedDraftContext {
    guard
      let suite,
      let data = suite.data(forKey: contextKey),
      let context = try? JSONDecoder().decode(SharedDraftContext.self, from: data)
    else {
      return SharedDraftContext(
        walletAddress: nil,
        installID: nil,
        liveURL: CleanAppShareConstants.defaultLiveURL,
        appVersion: nil
      )
    }
    return context
  }

  func save(_ context: SharedDraftContext) throws {
    guard let suite else {
      throw NSError(domain: "CleanAppShare", code: 1, userInfo: [NSLocalizedDescriptionKey: "App Group user defaults unavailable"])
    }
    let data = try JSONEncoder().encode(context)
    suite.set(data, forKey: contextKey)
  }
}
