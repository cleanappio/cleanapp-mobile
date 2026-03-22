import Foundation
import UniformTypeIdentifiers
import UIKit

enum ShareParserError: LocalizedError {
  case noUsablePayload

  var errorDescription: String? {
    "no usable share payload"
  }
}

final class ShareParser {
  func parse(
    from extensionContext: NSExtensionContext,
    completion: @escaping (Result<SharedIncomingReport, Error>) -> Void
  ) {
    let items = extensionContext.inputItems.compactMap { $0 as? NSExtensionItem }
    guard !items.isEmpty else {
      completion(.failure(ShareParserError.noUsablePayload))
      return
    }

    let group = DispatchGroup()
    var resolvedURL: String?
    var resolvedText: String?
    var resolvedImagePath: String?

    for item in items {
      for provider in item.attachments ?? [] {
        if resolvedURL == nil && provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
          group.enter()
          provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { item, _ in
            defer { group.leave() }
            if let url = item as? URL {
              resolvedURL = url.absoluteString
            } else if let data = item as? Data, let url = URL(dataRepresentation: data, relativeTo: nil) {
              resolvedURL = url.absoluteString
            }
          }
        }

        if resolvedText == nil && provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
          group.enter()
          provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { item, _ in
            defer { group.leave() }
            if let text = item as? String {
              resolvedText = text
            } else if let attributed = item as? NSAttributedString {
              resolvedText = attributed.string
            }
          }
        }

        if resolvedImagePath == nil && provider.hasItemConformingToTypeIdentifier(UTType.image.identifier) {
          group.enter()
          provider.loadItem(forTypeIdentifier: UTType.image.identifier, options: nil) { item, _ in
            defer { group.leave() }
            resolvedImagePath = self.persistTemporaryImage(item: item)
          }
        }
      }
    }

    group.notify(queue: .main) {
      let report = SharedIncomingReport(
        sourceApp: nil,
        sourceURL: resolvedURL,
        sharedText: resolvedText,
        localImagePath: resolvedImagePath,
        platform: "ios",
        captureMode: "share_extension"
      )
      guard report.normalizedSourceURL != nil || report.normalizedSharedText != nil || report.hasImage else {
        completion(.failure(ShareParserError.noUsablePayload))
        return
      }
      completion(.success(report))
    }
  }

  private func persistTemporaryImage(item: NSSecureCoding?) -> String? {
    let destinationURL = temporaryImageURL()
    do {
      switch item {
      case let url as URL:
        if FileManager.default.fileExists(atPath: destinationURL.path) {
          try FileManager.default.removeItem(at: destinationURL)
        }
        try FileManager.default.copyItem(at: url, to: destinationURL)
      case let image as UIImage:
        guard let data = image.jpegData(compressionQuality: 0.92) else {
          return nil
        }
        try data.write(to: destinationURL, options: [.atomic])
      case let data as Data:
        try data.write(to: destinationURL, options: [.atomic])
      default:
        return nil
      }
      return destinationURL.path
    } catch {
      NSLog("[ShareToCleanApp] share_parse_image_failed error=%@", String(describing: error))
      return nil
    }
  }

  private func temporaryImageURL() -> URL {
    let directory = URL(fileURLWithPath: NSTemporaryDirectory(), isDirectory: true)
      .appendingPathComponent("CleanAppShare", isDirectory: true)
    try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    return directory.appendingPathComponent("\(UUID().uuidString).jpg")
  }
}
