import Foundation

final class SharedDraftStore {
  private let encoder = JSONEncoder()
  private let decoder = JSONDecoder()

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
    if let imagePath = draft.localImagePath?.trimmedNilIfEmpty {
      persisted.localImagePath = try persistImageIfNeeded(imagePath: imagePath, draftID: draft.id)
    }
    let data = try encoder.encode(persisted)
    try data.write(to: jsonURL(for: draft.id), options: [.atomic])
  }

  func removeDraft(id: String, imagePath: String?) throws {
    let jsonURL = jsonURL(for: id)
    if FileManager.default.fileExists(atPath: jsonURL.path) {
      try FileManager.default.removeItem(at: jsonURL)
    }
    if let imagePath = imagePath?.trimmedNilIfEmpty, imagePath.hasPrefix(imagesDirectory.path), FileManager.default.fileExists(atPath: imagePath) {
      try FileManager.default.removeItem(atPath: imagePath)
    }
  }

  private func jsonURL(for id: String) -> URL {
    draftsDirectory.appendingPathComponent("\(id).json")
  }

  private func ensureDirectories() throws {
    try FileManager.default.createDirectory(at: draftsDirectory, withIntermediateDirectories: true)
    try FileManager.default.createDirectory(at: imagesDirectory, withIntermediateDirectories: true)
  }

  private func persistImageIfNeeded(imagePath: String, draftID: String) throws -> String {
    let sourceURL = URL(fileURLWithPath: imagePath)
    if sourceURL.path.hasPrefix(imagesDirectory.path) {
      return sourceURL.path
    }
    let ext = sourceURL.pathExtension.isEmpty ? "jpg" : sourceURL.pathExtension
    let destinationURL = imagesDirectory.appendingPathComponent("\(draftID).\(ext)")
    if FileManager.default.fileExists(atPath: destinationURL.path) {
      try FileManager.default.removeItem(at: destinationURL)
    }
    try FileManager.default.copyItem(at: sourceURL, to: destinationURL)
    return destinationURL.path
  }
}
