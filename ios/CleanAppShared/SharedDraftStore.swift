import Foundation

final class SharedDraftStore {
  private let encoder = JSONEncoder()
  private let decoder = JSONDecoder()
  private let successfulSubmissionsKey = "cleanapp.successful_shared_submissions"
  private let suite = UserDefaults(suiteName: CleanAppShareConstants.appGroupID)

  private var draftsDirectory: URL {
    containerURL.appendingPathComponent("SharedReportDrafts", isDirectory: true)
  }

  private var imagesDirectory: URL {
    draftsDirectory.appendingPathComponent("images", isDirectory: true)
  }

  private var containerURL: URL {
    guard let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: CleanAppShareConstants.appGroupID) else {
      return URL(fileURLWithPath: NSTemporaryDirectory(), isDirectory: true)
    }
    return container
  }

  init() {
    try? ensureDirectories()
  }

  func loadPendingDrafts() throws -> [SharedIncomingReport] {
    try ensureDirectories()
    let files = try FileManager.default.contentsOfDirectory(
      at: draftsDirectory,
      includingPropertiesForKeys: nil,
      options: [.skipsHiddenFiles]
    )
    return try files
      .filter { $0.pathExtension == "json" }
      .sorted { $0.lastPathComponent < $1.lastPathComponent }
      .map { url in
        let data = try Data(contentsOf: url)
        return try decoder.decode(SharedIncomingReport.self, from: data)
      }
  }

  func saveDraft(_ draft: SharedIncomingReport) throws {
    try ensureDirectories()
    var persisted = draft
    if !draft.localImagePaths.isEmpty {
      persisted.localImagePaths = try persistImagesIfNeeded(imagePaths: draft.localImagePaths, draftID: draft.id)
    }
    let data = try encoder.encode(persisted)
    try data.write(to: jsonURL(for: draft.id), options: [.atomic])
  }

  func removeDraft(id: String, imagePaths: [String]) throws {
    let jsonURL = jsonURL(for: id)
    if FileManager.default.fileExists(atPath: jsonURL.path) {
      try FileManager.default.removeItem(at: jsonURL)
    }
    for imagePath in imagePaths {
      guard let trimmed = imagePath.trimmedNilIfEmpty,
            trimmed.hasPrefix(imagesDirectory.path),
            FileManager.default.fileExists(atPath: trimmed) else {
        continue
      }
      try FileManager.default.removeItem(atPath: trimmed)
    }
  }

  func recordSuccessfulSubmission(_ receipt: SharedSubmissionReceipt) {
    guard let suite else {
      return
    }

    var receipts = loadSuccessfulSubmissions()
    receipts.removeAll { $0.shareID == receipt.shareID }
    receipts.append(receipt)
    if let data = try? encoder.encode(receipts) {
      suite.set(data, forKey: successfulSubmissionsKey)
    }
  }

  func consumeSuccessfulSubmissions() -> [SharedSubmissionReceipt] {
    guard let suite else {
      return []
    }
    let receipts = loadSuccessfulSubmissions()
    suite.removeObject(forKey: successfulSubmissionsKey)
    return receipts
  }

  private func jsonURL(for id: String) -> URL {
    draftsDirectory.appendingPathComponent("\(id).json")
  }

  private func ensureDirectories() throws {
    try FileManager.default.createDirectory(at: draftsDirectory, withIntermediateDirectories: true)
    try FileManager.default.createDirectory(at: imagesDirectory, withIntermediateDirectories: true)
  }

  private func loadSuccessfulSubmissions() -> [SharedSubmissionReceipt] {
    guard
      let suite,
      let data = suite.data(forKey: successfulSubmissionsKey),
      let receipts = try? decoder.decode([SharedSubmissionReceipt].self, from: data)
    else {
      return []
    }
    return receipts
  }

  private func persistImagesIfNeeded(imagePaths: [String], draftID: String) throws -> [String] {
    var persisted: [String] = []
    for (index, imagePath) in imagePaths.enumerated() {
      guard let trimmed = imagePath.trimmedNilIfEmpty else {
        continue
      }
      let sourceURL = URL(fileURLWithPath: trimmed)
      if sourceURL.path.hasPrefix(imagesDirectory.path) {
        persisted.append(sourceURL.path)
        continue
      }
      let ext = sourceURL.pathExtension.isEmpty ? "jpg" : sourceURL.pathExtension
      let destinationURL = imagesDirectory.appendingPathComponent("\(draftID)-\(index).\(ext)")
      if FileManager.default.fileExists(atPath: destinationURL.path) {
        try FileManager.default.removeItem(at: destinationURL)
      }
      try FileManager.default.copyItem(at: sourceURL, to: destinationURL)
      persisted.append(destinationURL.path)
    }
    return persisted
  }
}
