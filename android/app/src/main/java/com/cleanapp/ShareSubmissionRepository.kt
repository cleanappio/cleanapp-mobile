package com.cleanapp

import android.util.Log
import org.json.JSONObject
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.DataOutputStream
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLConnection

class ShareSubmissionRepository {
  data class SubmissionResult(
    val reportId: Int?,
    val publicId: String?,
    val receiptId: String?,
  )

  fun submit(report: SharedIncomingReport, context: SharedDraftContext, timeoutMillis: Int = 12_000): SubmissionResult {
    require(report.normalizedSourceUrl() != null || report.normalizedSharedText() != null || report.hasImages()) {
      "no usable share payload"
    }

    val endpoint = URL("${context.liveUrl.trimEnd('/')}/api/v3/reports/digital-share")
    val connection = (endpoint.openConnection() as HttpURLConnection).apply {
      requestMethod = "POST"
      connectTimeout = timeoutMillis
      readTimeout = timeoutMillis
      doInput = true
      useCaches = false
    }

    try {
      if (report.hasImages()) {
        val boundary = "CleanAppShareBoundary-${report.id}"
        connection.doOutput = true
        connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
        DataOutputStream(BufferedOutputStream(connection.outputStream)).use { stream ->
          val payload = buildFields(report, context)
          payload.forEach { (key, value) ->
            writeFormField(stream, boundary, key, value)
          }
          report.existingImagePaths().take(6).forEach { imagePath ->
            writeImagePart(stream, boundary, imagePath)
          }
          stream.writeBytes("--$boundary--\r\n")
          stream.flush()
        }
      } else {
        connection.doOutput = true
        connection.setRequestProperty("Content-Type", "application/json")
        val payload = JSONObject(buildFields(report, context))
        connection.outputStream.use { output ->
          output.write(payload.toString().toByteArray(Charsets.UTF_8))
        }
      }

      val responseCode = connection.responseCode
      val responseBody =
        runCatching {
          val stream =
            if (responseCode in 200..299) {
              connection.inputStream
            } else {
              connection.errorStream ?: connection.inputStream
            }
          stream.bufferedReader().use { it.readText() }
        }.getOrDefault("")

      if (responseCode !in 200..299) {
        throw IllegalStateException("upload failed ($responseCode): $responseBody")
      }

      val json = runCatching { JSONObject(responseBody) }.getOrDefault(JSONObject())
      return SubmissionResult(
        reportId = json.optInt("report_id").takeIf { it > 0 },
        publicId = json.optString("public_id").takeIf { it.isNotBlank() },
        receiptId = json.optString("receipt_id").takeIf { it.isNotBlank() },
      )
    } finally {
      connection.disconnect()
    }
  }

  private fun buildFields(report: SharedIncomingReport, context: SharedDraftContext): Map<String, String> {
    val fields = linkedMapOf(
      "platform" to report.platform,
      "capture_mode" to report.captureMode,
      "client_created_at" to report.createdAt,
      "client_submission_id" to report.id,
    )
    report.normalizedSourceUrl()?.let { fields["source_url"] = it }
    report.normalizedSharedText()?.let { fields["shared_text"] = it }
    report.sourceApp?.trim()?.takeIf { it.isNotEmpty() }?.let { fields["source_app"] = it }
    context.walletAddress?.trim()?.takeIf { it.isNotEmpty() }?.let { fields["reporter_id"] = it }
    context.installId?.trim()?.takeIf { it.isNotEmpty() }?.let { fields["device_id"] = it }
    context.appVersion?.trim()?.takeIf { it.isNotEmpty() }?.let { fields["app_version"] = it }
    return fields
  }

  private fun writeFormField(stream: DataOutputStream, boundary: String, name: String, value: String) {
    stream.writeBytes("--$boundary\r\n")
    stream.writeBytes("Content-Disposition: form-data; name=\"$name\"\r\n\r\n")
    stream.writeBytes(value)
    stream.writeBytes("\r\n")
  }

  private fun writeImagePart(stream: DataOutputStream, boundary: String, imagePath: String) {
    val file = File(imagePath)
    val mimeType = URLConnection.guessContentTypeFromName(file.name) ?: "image/jpeg"
    stream.writeBytes("--$boundary\r\n")
    stream.writeBytes("Content-Disposition: form-data; name=\"attachments\"; filename=\"${file.name}\"\r\n")
    stream.writeBytes("Content-Type: $mimeType\r\n\r\n")
    BufferedInputStream(file.inputStream()).use { input ->
      input.copyTo(stream)
    }
    stream.writeBytes("\r\n")
  }

  fun submitOrThrow(report: SharedIncomingReport, context: SharedDraftContext): SubmissionResult {
    Log.i("ShareToCleanApp", "share_submit_started id=${report.id} payload=${report.payloadType()}")
    return submit(report, context)
  }
}
