import Foundation
import UniformTypeIdentifiers

enum ShareSubmitterError: LocalizedError {
  case invalidPayload
  case invalidResponse
  case uploadFailed(Int, String)

  var errorDescription: String? {
    switch self {
    case .invalidPayload:
      return "no usable share payload"
    case .invalidResponse:
      return "invalid backend response"
    case let .uploadFailed(code, body):
      return "upload failed (\(code)): \(body)"
    }
  }
}

struct ShareSubmissionResult {
  let reportID: Int?
  let publicID: String?
  let receiptID: String?
}

final class ShareSubmitter {
  func submit(
    report: SharedIncomingReport,
    context: SharedDraftContext,
    timeout: TimeInterval = 12,
    completion: @escaping (Result<ShareSubmissionResult, Error>) -> Void
  ) {
    guard report.normalizedSourceURL != nil || report.normalizedSharedText != nil || report.hasImages else {
      completion(.failure(ShareSubmitterError.invalidPayload))
      return
    }

    let endpoint = shareEndpoint(for: context.liveURL)
    var request = URLRequest(url: endpoint)
    request.httpMethod = "POST"
    request.timeoutInterval = timeout

    if report.hasImages {
      let boundary = "CleanAppShareBoundary-\(UUID().uuidString)"
      request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
      request.httpBody = buildMultipartBody(report: report, context: context, boundary: boundary)
    } else {
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.httpBody = try? JSONSerialization.data(withJSONObject: buildJSONObject(report: report, context: context), options: [])
    }

    URLSession.shared.dataTask(with: request) { data, response, error in
      if let error {
        completion(.failure(error))
        return
      }
      guard let httpResponse = response as? HTTPURLResponse else {
        completion(.failure(ShareSubmitterError.invalidResponse))
        return
      }

      let body = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
      guard (200 ..< 300).contains(httpResponse.statusCode) else {
        completion(.failure(ShareSubmitterError.uploadFailed(httpResponse.statusCode, body)))
        return
      }

      let payload = (try? JSONSerialization.jsonObject(with: data ?? Data(), options: [])) as? [String: Any]
      let result = ShareSubmissionResult(
        reportID: payload?["report_id"] as? Int,
        publicID: payload?["public_id"] as? String,
        receiptID: payload?["receipt_id"] as? String
      )
      completion(.success(result))
    }.resume()
  }

  private func shareEndpoint(for liveURL: String) -> URL {
    let trimmed = liveURL.trimmingCharacters(in: .whitespacesAndNewlines)
    let base = trimmed.isEmpty ? CleanAppShareConstants.defaultLiveURL : trimmed
    return URL(string: "\(base)/api/v3/reports/digital-share")!
  }

  private func buildJSONObject(report: SharedIncomingReport, context: SharedDraftContext) -> [String: Any] {
    var payload: [String: Any] = [
      "platform": report.platform,
      "capture_mode": report.captureMode,
      "client_created_at": report.createdAt,
      "client_submission_id": report.id,
    ]
    if let sourceURL = report.normalizedSourceURL {
      payload["source_url"] = sourceURL
    }
    if let sharedText = report.normalizedSharedText {
      payload["shared_text"] = sharedText
    }
    if let sourceApp = report.sourceApp?.trimmedNilIfEmpty {
      payload["source_app"] = sourceApp
    }
    if let walletAddress = context.walletAddress?.trimmedNilIfEmpty {
      payload["reporter_id"] = walletAddress
    }
    if let installID = context.installID?.trimmedNilIfEmpty {
      payload["device_id"] = installID
    }
    if let appVersion = context.appVersion?.trimmedNilIfEmpty {
      payload["app_version"] = appVersion
    }
    return payload
  }

  private func buildMultipartBody(report: SharedIncomingReport, context: SharedDraftContext, boundary: String) -> Data {
    var body = Data()
    let payload = buildJSONObject(report: report, context: context)

    for (key, value) in payload {
      body.append("--\(boundary)\r\n")
      body.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n")
      body.append("\(value)\r\n")
    }

    for imagePath in report.existingLocalImagePaths.prefix(6) {
      guard let imageData = try? Data(contentsOf: URL(fileURLWithPath: imagePath)) else {
        continue
      }
      let mimeType = detectMimeType(for: imagePath)
      let filename = URL(fileURLWithPath: imagePath).lastPathComponent
      body.append("--\(boundary)\r\n")
      body.append("Content-Disposition: form-data; name=\"attachments\"; filename=\"\(filename)\"\r\n")
      body.append("Content-Type: \(mimeType)\r\n\r\n")
      body.append(imageData)
      body.append("\r\n")
    }

    body.append("--\(boundary)--\r\n")
    return body
  }

  private func detectMimeType(for path: String) -> String {
    let ext = URL(fileURLWithPath: path).pathExtension
    if !ext.isEmpty, let type = UTType(filenameExtension: ext)?.preferredMIMEType {
      return type
    }
    return "image/jpeg"
  }
}

private extension Data {
  mutating func append(_ string: String) {
    if let data = string.data(using: .utf8) {
      append(data)
    }
  }
}
