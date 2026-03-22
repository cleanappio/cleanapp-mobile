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
  private let maxSharedImages = 6

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
    let lock = NSLock()
    var resolvedURL: String?
    var resolvedText: String?
    var resolvedImagePaths: [String] = []

    for item in items {
      for provider in item.attachments ?? [] {
        if resolvedURL == nil && provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
          group.enter()
          provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { item, _ in
            defer { group.leave() }
            if let url = item as? URL {
              lock.lock()
              if resolvedURL == nil {
                resolvedURL = url.absoluteString
              }
              lock.unlock()
            } else if let data = item as? Data, let url = URL(dataRepresentation: data, relativeTo: nil) {
              lock.lock()
              if resolvedURL == nil {
                resolvedURL = url.absoluteString
              }
              lock.unlock()
            }
          }
        }

        if resolvedText == nil && provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
          group.enter()
          provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { item, _ in
            defer { group.leave() }
            if let text = item as? String {
              lock.lock()
              if resolvedText == nil {
                resolvedText = text
              }
              lock.unlock()
            } else if let attributed = item as? NSAttributedString {
              lock.lock()
              if resolvedText == nil {
                resolvedText = attributed.string
              }
              lock.unlock()
            }
          }
        }

        if provider.hasItemConformingToTypeIdentifier(UTType.image.identifier) {
          group.enter()
          provider.loadItem(forTypeIdentifier: UTType.image.identifier, options: nil) { item, _ in
            defer { group.leave() }
            guard let imagePath = self.persistTemporaryImage(item: item) else {
              return
            }
            lock.lock()
            if resolvedImagePaths.count < self.maxSharedImages, !resolvedImagePaths.contains(imagePath) {
              resolvedImagePaths.append(imagePath)
            }
            lock.unlock()
          }
        }
      }
    }

    group.notify(queue: .main) {
      let report = SharedIncomingReport(
        sourceApp: nil,
        sourceURL: resolvedURL,
        sharedText: resolvedText,
        localImagePaths: Array(resolvedImagePaths.prefix(self.maxSharedImages)),
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
