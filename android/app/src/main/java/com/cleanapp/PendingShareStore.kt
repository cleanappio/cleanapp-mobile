package com.cleanapp

import android.content.Context
import android.net.Uri
import android.webkit.MimeTypeMap
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

class PendingShareStore(private val context: Context) {
  private val prefs = context.getSharedPreferences("cleanapp_share_drafts", Context.MODE_PRIVATE)
  private val contextPrefs = context.getSharedPreferences("cleanapp_share_context", Context.MODE_PRIVATE)
  private val draftsKey = "drafts"
  private val defaultLiveUrl = "https://live.cleanapp.io"

  fun saveContext(sharedDraftContext: SharedDraftContext) {
    contextPrefs
      .edit()
      .putString("walletAddress", sharedDraftContext.walletAddress)
      .putString("installId", sharedDraftContext.installId)
      .putString("liveUrl", sharedDraftContext.liveUrl)
      .putString("appVersion", sharedDraftContext.appVersion)
      .apply()
  }

  fun loadContext(): SharedDraftContext =
    SharedDraftContext(
      walletAddress = contextPrefs.getString("walletAddress", null),
      installId = contextPrefs.getString("installId", null),
      liveUrl = contextPrefs.getString("liveUrl", defaultLiveUrl) ?: defaultLiveUrl,
      appVersion = contextPrefs.getString("appVersion", null),
    )

  fun loadDrafts(): List<SharedIncomingReport> {
    val raw = prefs.getString(draftsKey, null) ?: return emptyList()
    return runCatching {
      val array = JSONArray(raw)
      buildList {
        for (index in 0 until array.length()) {
          add(array.getJSONObject(index).toSharedIncomingReport())
        }
      }
    }.getOrDefault(emptyList())
  }

  fun saveDraft(report: SharedIncomingReport) {
    val persisted = report.copy(localImagePaths = persistImagePathsIfNeeded(report))
    val drafts = loadDrafts().filterNot { it.id == persisted.id }.toMutableList()
    drafts.add(persisted)
    persistDrafts(drafts)
  }

  fun removeDraft(report: SharedIncomingReport) {
    val drafts = loadDrafts().filterNot { it.id == report.id }
    persistDrafts(drafts)
    report.localImagePaths.forEach { imagePath ->
      val trimmed = imagePath.trim().takeIf { it.isNotEmpty() } ?: return@forEach
      val file = File(trimmed)
      if (file.exists() && file.absolutePath.startsWith(imagesDir().absolutePath)) {
        file.delete()
      }
    }
  }

  fun clearAll() {
    prefs.edit().remove(draftsKey).apply()
  }

  private fun persistDrafts(drafts: List<SharedIncomingReport>) {
    val array = JSONArray()
    drafts.forEach { array.put(it.toJson()) }
    prefs.edit().putString(draftsKey, array.toString()).apply()
  }

  private fun persistImagePathsIfNeeded(report: SharedIncomingReport): List<String> {
    val persisted = mutableListOf<String>()
    report.localImagePaths.forEachIndexed { index, imagePath ->
      val trimmed = imagePath.trim().takeIf { it.isNotEmpty() } ?: return@forEachIndexed
      val imageFile = File(trimmed)
      if (imageFile.exists() && imageFile.absolutePath.startsWith(imagesDir().absolutePath)) {
        persisted += imageFile.absolutePath
        return@forEachIndexed
      }
      if (!imageFile.exists()) {
        return@forEachIndexed
      }
      imagesDir().mkdirs()
      val extension = imageFile.extension.ifBlank { "jpg" }
      val destination = File(imagesDir(), "${report.id}-$index.$extension")
      if (destination.exists()) {
        destination.delete()
      }
      imageFile.copyTo(destination, overwrite = true)
      persisted += destination.absolutePath
    }
    return persisted
  }

  fun copyIncomingImages(uris: List<Uri>): List<String> {
    return uris.mapNotNull { uri ->
      runCatching {
        imagesDir().mkdirs()
        val extension =
          MimeTypeMap.getSingleton()
            .getExtensionFromMimeType(context.contentResolver.getType(uri))
            ?.takeIf { it.isNotBlank() }
            ?: "jpg"
        val destination = File(imagesDir(), "${System.currentTimeMillis()}-${uri.lastPathSegment?.hashCode() ?: 0}.$extension")
        context.contentResolver.openInputStream(uri).use { input ->
          requireNotNull(input) { "Unable to open shared image" }
          FileOutputStream(destination).use { output -> input.copyTo(output) }
        }
        destination.absolutePath
      }.getOrNull()
    }
  }

  fun copyIncomingImage(uri: Uri): String? {
    return runCatching {
      imagesDir().mkdirs()
      val extension =
        MimeTypeMap.getSingleton()
          .getExtensionFromMimeType(context.contentResolver.getType(uri))
          ?.takeIf { it.isNotBlank() }
          ?: "jpg"
      val destination = File(imagesDir(), "${System.currentTimeMillis()}-${uri.lastPathSegment?.hashCode() ?: 0}.$extension")
      context.contentResolver.openInputStream(uri).use { input ->
        requireNotNull(input) { "Unable to open shared image" }
        FileOutputStream(destination).use { output -> input.copyTo(output) }
      }
      destination.absolutePath
    }.getOrNull()
  }

  private fun imagesDir(): File = File(context.filesDir, "pending-share-images")

  private fun SharedIncomingReport.toJson(): JSONObject =
    JSONObject().apply {
      put("id", id)
      put("createdAt", createdAt)
      put("sourceApp", sourceApp)
      put("sourceUrl", sourceUrl)
      put("sharedText", sharedText)
      put("localImagePaths", JSONArray(localImagePaths))
      put("platform", platform)
      put("captureMode", captureMode)
      put("submissionState", submissionState)
      put("failureReason", failureReason)
    }

  private fun JSONObject.toSharedIncomingReport(): SharedIncomingReport =
    SharedIncomingReport(
      id = optString("id"),
      createdAt = optString("createdAt"),
      sourceApp = optString("sourceApp").takeIf { it.isNotBlank() },
      sourceUrl = optString("sourceUrl").takeIf { it.isNotBlank() },
      sharedText = optString("sharedText").takeIf { it.isNotBlank() },
      localImagePaths = buildList {
        val pathArray = optJSONArray("localImagePaths")
        if (pathArray != null) {
          for (index in 0 until pathArray.length()) {
            pathArray.optString(index).takeIf { it.isNotBlank() }?.let { add(it) }
          }
        } else {
          optString("localImagePath").takeIf { it.isNotBlank() }?.let { add(it) }
        }
      },
      platform = optString("platform", "android"),
      captureMode = optString("captureMode", "android_share_intent"),
      submissionState = optString("submissionState", "pending"),
      failureReason = optString("failureReason").takeIf { it.isNotBlank() },
    )
}
