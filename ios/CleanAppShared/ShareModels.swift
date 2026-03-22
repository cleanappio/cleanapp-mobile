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
  var localImagePaths: [String]
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
    localImagePaths: [String] = [],
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
    self.localImagePaths = SharedIncomingReport.normalizeImagePaths(localImagePaths, legacyPath: localImagePath)
    self.platform = platform
    self.captureMode = captureMode
    self.submissionState = submissionState
    self.failureReason = failureReason?.trimmedNilIfEmpty
  }

  enum CodingKeys: String, CodingKey {
    case id
    case createdAt
    case sourceApp
    case sourceURL
    case sharedText
    case localImagePaths
    case localImagePath
    case platform
    case captureMode
    case submissionState
    case failureReason
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    id = try container.decodeIfPresent(String.self, forKey: .id) ?? UUID().uuidString.lowercased()
    createdAt = try container.decodeIfPresent(String.self, forKey: .createdAt) ?? ShareDate.iso8601String(from: Date())
    sourceApp = try container.decodeIfPresent(String.self, forKey: .sourceApp)
    sourceURL = SharedIncomingReport.normalizeURL(try container.decodeIfPresent(String.self, forKey: .sourceURL))
    sharedText = try container.decodeIfPresent(String.self, forKey: .sharedText)?.trimmedNilIfEmpty
    localImagePaths = SharedIncomingReport.normalizeImagePaths(
      (try container.decodeIfPresent([String].self, forKey: .localImagePaths)) ?? [],
      legacyPath: try container.decodeIfPresent(String.self, forKey: .localImagePath)
    )
    platform = try container.decodeIfPresent(String.self, forKey: .platform) ?? "ios"
    captureMode = try container.decodeIfPresent(String.self, forKey: .captureMode) ?? "share_extension"
    submissionState = try container.decodeIfPresent(SharedIncomingReportSubmissionState.self, forKey: .submissionState) ?? .pending
    failureReason = try container.decodeIfPresent(String.self, forKey: .failureReason)?.trimmedNilIfEmpty
  }

  func encode(to encoder: Encoder) throws {
    var container = encoder.container(keyedBy: CodingKeys.self)
    try container.encode(id, forKey: .id)
    try container.encode(createdAt, forKey: .createdAt)
    try container.encodeIfPresent(sourceApp?.trimmedNilIfEmpty, forKey: .sourceApp)
    try container.encodeIfPresent(SharedIncomingReport.normalizeURL(sourceURL), forKey: .sourceURL)
    try container.encodeIfPresent(sharedText?.trimmedNilIfEmpty, forKey: .sharedText)
    try container.encode(localImagePaths, forKey: .localImagePaths)
    try container.encode(platform, forKey: .platform)
    try container.encode(captureMode, forKey: .captureMode)
    try container.encode(submissionState, forKey: .submissionState)
    try container.encodeIfPresent(failureReason?.trimmedNilIfEmpty, forKey: .failureReason)
  }

  var payloadType: String {
    switch (normalizedSourceURL != nil, normalizedSharedText != nil, hasImages) {
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
    hasImages
  }

  var hasImages: Bool {
    !existingLocalImagePaths.isEmpty
  }

  var localImagePath: String? {
    existingLocalImagePaths.first ?? localImagePaths.first
  }

  var existingLocalImagePaths: [String] {
    localImagePaths.filter { FileManager.default.fileExists(atPath: $0) }
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

  private static func normalizeImagePaths(_ imagePaths: [String], legacyPath: String?) -> [String] {
    var normalized: [String] = []
    let combined: [String?] = [legacyPath] + imagePaths.map(Optional.some)
    for rawPath in combined {
      guard let trimmed = rawPath?.trimmedNilIfEmpty else {
        continue
      }
      if !normalized.contains(trimmed) {
        normalized.append(trimmed)
      }
    }
    return normalized
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

struct SharedSubmissionReceipt: Codable {
  var shareID: String
  var reportID: Int?
  var publicID: String?
  var receiptID: String?
  var createdAt: String

  init(
    shareID: String,
    reportID: Int?,
    publicID: String?,
    receiptID: String?,
    createdAt: String = ShareDate.iso8601String(from: Date())
  ) {
    self.shareID = shareID
    self.reportID = reportID
    self.publicID = publicID?.trimmedNilIfEmpty
    self.receiptID = receiptID?.trimmedNilIfEmpty
    self.createdAt = createdAt
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
