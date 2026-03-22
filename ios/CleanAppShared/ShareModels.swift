import Foundation

enum SharedIncomingReportSubmissionState: String, Codable {
  case pending
  case submitting
  case submitted
  case failed
}

struct SharedIncomingReport: Codable {
  var id: String
  var createdAt: String
  var sourceApp: String?
  var sourceURL: String?
  var sharedText: String?
  var localImagePath: String?
  var platform: String
  var captureMode: String
  var submissionState: SharedIncomingReportSubmissionState
  var failureReason: String?

  init(
    id: String = UUID().uuidString.lowercased(),
    createdAt: String = ShareDate.iso8601String(from: Date()),
    sourceApp: String? = nil,
    sourceURL: String? = nil,
    sharedText: String? = nil,
    localImagePath: String? = nil,
    platform: String,
    captureMode: String,
    submissionState: SharedIncomingReportSubmissionState = .pending,
    failureReason: String? = nil
  ) {
    self.id = id
    self.createdAt = createdAt
    self.sourceApp = sourceApp?.trimmedNilIfEmpty
    self.sourceURL = SharedIncomingReport.normalizeURL(sourceURL)
    self.sharedText = sharedText?.trimmedNilIfEmpty
    self.localImagePath = localImagePath?.trimmedNilIfEmpty
    self.platform = platform
    self.captureMode = captureMode
    self.submissionState = submissionState
    self.failureReason = failureReason?.trimmedNilIfEmpty
  }

  var payloadType: String {
    switch (normalizedSourceURL != nil, normalizedSharedText != nil, hasImage) {
    case (true, true, true):
      return "url+text+image"
    case (true, false, true):
      return "url+image"
    case (false, true, true):
      return "text+image"
    case (true, true, false):
      return "url+text"
    case (true, false, false):
      return "url"
    case (false, true, false):
      return "text"
    case (false, false, true):
      return "image"
    default:
      return "empty"
    }
  }

  var normalizedSourceURL: String? {
    if let explicit = SharedIncomingReport.normalizeURL(sourceURL) {
      return explicit
    }
    guard let sharedText = sharedText?.trimmedNilIfEmpty else {
      return nil
    }
    return SharedIncomingReport.normalizeURL(sharedText)
  }

  var normalizedSharedText: String? {
    guard let text = sharedText?.trimmingCharacters(in: .whitespacesAndNewlines), !text.isEmpty else {
      return nil
    }
    if normalizedSourceURL != nil,
       let normalizedTextURL = SharedIncomingReport.normalizeURL(text),
       normalizedTextURL == normalizedSourceURL {
      return nil
    }
    return text
  }

  var hasImage: Bool {
    guard let localImagePath = localImagePath?.trimmedNilIfEmpty else {
      return false
    }
    return FileManager.default.fileExists(atPath: localImagePath)
  }

  static func normalizeURL(_ raw: String?) -> String? {
    guard var candidate = raw?.trimmingCharacters(in: .whitespacesAndNewlines), !candidate.isEmpty else {
      return nil
    }
    if !candidate.lowercased().hasPrefix("http://") && !candidate.lowercased().hasPrefix("https://") {
      if !looksLikeURL(candidate) {
        return nil
      }
      candidate = "https://" + candidate
    }
    guard var components = URLComponents(string: candidate), let host = components.host?.lowercased() else {
      return nil
    }
    var normalizedHost = host
    if normalizedHost.hasPrefix("www.") {
      normalizedHost.removeFirst(4)
    }
    if normalizedHost == "twitter.com" {
      normalizedHost = "x.com"
    }
    components.scheme = "https"
    components.host = normalizedHost
    components.fragment = nil
    if components.path.hasSuffix("/") && components.path != "/" {
      components.path = String(components.path.dropLast())
    }
    return components.url?.absoluteString
  }

  private static func looksLikeURL(_ raw: String) -> Bool {
    let lower = raw.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    if lower.isEmpty || lower.contains(where: \.isWhitespace) {
      return false
    }
    return lower.contains(".") || lower.hasPrefix("x.com/") || lower.hasPrefix("twitter.com/")
  }
}

struct SharedDraftContext: Codable {
  var walletAddress: String?
  var installID: String?
  var liveURL: String
  var appVersion: String?

  init(walletAddress: String?, installID: String?, liveURL: String, appVersion: String?) {
    self.walletAddress = walletAddress?.trimmedNilIfEmpty
    self.installID = installID?.trimmedNilIfEmpty
    self.liveURL = liveURL.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "https://live.cleanapp.io" : liveURL
    self.appVersion = appVersion?.trimmedNilIfEmpty
  }
}

enum ShareDate {
  static let formatter: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter
  }()

  static func iso8601String(from date: Date) -> String {
    formatter.string(from: date)
  }
}

extension String {
  var trimmedNilIfEmpty: String? {
    let trimmed = trimmingCharacters(in: .whitespacesAndNewlines)
    return trimmed.isEmpty ? nil : trimmed
  }
}
