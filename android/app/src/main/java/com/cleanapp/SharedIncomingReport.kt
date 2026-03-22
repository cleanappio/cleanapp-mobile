package com.cleanapp

import android.net.Uri
import java.io.File
import java.time.Instant
import java.util.UUID

data class SharedIncomingReport(
  val id: String = UUID.randomUUID().toString().lowercase(),
  val createdAt: String,
  val sourceApp: String? = null,
  val sourceUrl: String? = null,
  val sharedText: String? = null,
  val localImagePaths: List<String> = emptyList(),
  val platform: String,
  val captureMode: String,
  val submissionState: String = "pending",
  val failureReason: String? = null,
) {
  val localImagePath: String?
    get() = existingImagePaths().firstOrNull() ?: localImagePaths.firstOrNull()

  fun normalizedSourceUrl(): String? {
    normalizeUrl(sourceUrl)?.let { return it }
    return normalizeUrl(sharedText)
  }

  fun normalizedSharedText(): String? {
    val text = sharedText?.trim()?.takeIf { it.isNotEmpty() } ?: return null
    val normalizedUrl = normalizedSourceUrl()
    val normalizedTextUrl = normalizeUrl(text)
    if (normalizedUrl != null && normalizedTextUrl == normalizedUrl) {
      return null
    }
    return text
  }

  fun hasImage(): Boolean = hasImages()

  fun hasImages(): Boolean {
    return existingImagePaths().isNotEmpty()
  }

  fun existingImagePaths(): List<String> {
    return localImagePaths
      .mapNotNull { it.trim().takeIf(String::isNotEmpty) }
      .filter { File(it).exists() }
  }

  fun payloadType(): String {
    val hasUrl = normalizedSourceUrl() != null
    val hasText = normalizedSharedText() != null
    val hasImage = hasImages()
    return when {
      hasUrl && hasText && hasImage -> "url+text+image"
      hasUrl && hasImage -> "url+image"
      hasText && hasImage -> "text+image"
      hasUrl && hasText -> "url+text"
      hasUrl -> "url"
      hasText -> "text"
      hasImage -> "image"
      else -> "empty"
    }
  }

  companion object {
    fun normalizeUrl(raw: String?): String? {
      var candidate = raw?.trim()?.takeIf { it.isNotEmpty() } ?: return null
      val lower = candidate.lowercase()
      if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
        if (!looksLikeUrl(candidate)) {
          return null
        }
        candidate = "https://$candidate"
      }
      val uri = runCatching { Uri.parse(candidate) }.getOrNull() ?: return null
      val host = uri.host?.lowercase()?.removePrefix("www.") ?: return null
      val normalizedHost = if (host == "twitter.com") "x.com" else host
      val path = uri.path?.trimEnd('/').orEmpty()
      val pathValue = if (path.isEmpty()) "/" else path
      return Uri.Builder()
        .scheme("https")
        .encodedAuthority(normalizedHost)
        .encodedPath(pathValue)
        .encodedQuery(uri.encodedQuery)
        .build()
        .toString()
    }

    private fun looksLikeUrl(raw: String): Boolean {
      val normalized = raw.trim().lowercase()
      if (normalized.isEmpty() || normalized.any { it.isWhitespace() }) {
        return false
      }
      return normalized.contains(".") || normalized.startsWith("x.com/") || normalized.startsWith("twitter.com/")
    }
  }
}

data class SharedDraftContext(
  val walletAddress: String?,
  val installId: String?,
  val liveUrl: String,
  val appVersion: String?,
)

data class SharedSubmissionReceipt(
  val shareId: String,
  val reportId: Int?,
  val publicId: String?,
  val receiptId: String?,
  val createdAt: String? = Instant.now().toString(),
)
