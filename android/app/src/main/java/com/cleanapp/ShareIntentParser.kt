package com.cleanapp

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.util.Log
import java.time.Instant

class ShareIntentParser(
  private val activity: Activity,
  private val pendingShareStore: PendingShareStore,
) {
  fun parse(intent: Intent): SharedIncomingReport? {
    if (intent.action != Intent.ACTION_SEND) {
      return null
    }

    val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)?.trim()?.takeIf { it.isNotEmpty() }
    val imageUri = intent.parcelableExtraCompat<Uri>(Intent.EXTRA_STREAM)
    val localImagePath = imageUri?.let { pendingShareStore.copyIncomingImage(it) }
    val sourceApp = detectSourceApp(intent)

    val report =
      SharedIncomingReport(
        createdAt = Instant.now().toString(),
        sourceApp = sourceApp,
        sourceUrl = sharedText,
        sharedText = sharedText,
        localImagePath = localImagePath,
        platform = "android",
        captureMode = "android_share_intent",
      )

    if (report.normalizedSourceUrl() == null && report.normalizedSharedText() == null && !report.hasImage()) {
      Log.w("ShareToCleanApp", "share_parse_failed reason=no_usable_payload")
      return null
    }

    return report
  }

  private fun detectSourceApp(intent: Intent): String? {
    val referrerName = intent.getStringExtra(Intent.EXTRA_REFERRER_NAME)
    if (!referrerName.isNullOrBlank()) {
      return referrerName.removePrefix("android-app://")
    }

    activity.referrer?.host?.takeIf { it.isNotBlank() }?.let { return it }
    activity.callingActivity?.packageName?.takeIf { it.isNotBlank() }?.let { return it }
    return null
  }
}

private inline fun <reified T> Intent.parcelableExtraCompat(name: String): T? =
  when {
    android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU ->
      getParcelableExtra(name, T::class.java)
    else ->
      @Suppress("DEPRECATION")
      getParcelableExtra(name) as? T
  }
