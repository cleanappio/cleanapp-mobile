package com.cleanapp

import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class CleanAppShareModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "CleanAppShareModule"

  @ReactMethod
  fun syncShareContext(payload: ReadableMap, promise: Promise) {
    try {
      val store = PendingShareStore(reactContext)
      store.saveContext(
        SharedDraftContext(
          walletAddress = payload.getString("walletAddress"),
          installId = payload.getString("installId"),
          liveUrl = payload.getString("liveUrl") ?: "https://live.cleanapp.io",
          appVersion = payload.getString("appVersion"),
        ),
      )
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("share_context_error", error.message, error)
    }
  }

  @ReactMethod
  fun retryPendingSharedDrafts(promise: Promise) {
    try {
      enqueueRetryWork()
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("share_retry_error", error.message, error)
    }
  }

  @ReactMethod
  fun consumeSuccessfulSharedSubmissions(promise: Promise) {
    try {
      val store = PendingShareStore(reactContext)
      val receipts = Arguments.createArray()
      store.consumeSuccessfulSubmissions().forEach { receipt ->
        val map = Arguments.createMap()
        map.putString("shareID", receipt.shareId)
        receipt.reportId?.let { map.putInt("reportID", it) }
        map.putString("publicID", receipt.publicId)
        map.putString("receiptID", receipt.receiptId)
        map.putString("createdAt", receipt.createdAt)
        receipts.pushMap(map)
      }
      promise.resolve(receipts)
    } catch (error: Exception) {
      promise.reject("share_consume_success_error", error.message, error)
    }
  }

  private fun enqueueRetryWork() {
    val request =
      OneTimeWorkRequestBuilder<PendingShareWorker>()
        .setConstraints(
          Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build(),
        )
        .build()
    WorkManager.getInstance(reactContext)
      .enqueueUniqueWork("cleanapp-pending-share-retry", ExistingWorkPolicy.REPLACE, request)
  }
}
