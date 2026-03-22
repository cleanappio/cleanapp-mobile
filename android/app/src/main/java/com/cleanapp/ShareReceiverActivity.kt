package com.cleanapp

import android.app.Activity
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.widget.FrameLayout
import android.widget.ProgressBar
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.Executors

class ShareReceiverActivity : Activity() {
  private val executor = Executors.newSingleThreadExecutor()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val root = FrameLayout(this)
    val spinner = ProgressBar(this)
    root.addView(
      spinner,
      FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.WRAP_CONTENT,
        FrameLayout.LayoutParams.WRAP_CONTENT,
      ).apply {
        gravity = Gravity.CENTER
      },
    )
    setContentView(root)

    val store = PendingShareStore(this)
    val parser = ShareIntentParser(this, store)
    val report = parser.parse(intent)
    if (report == null) {
      finish()
      return
    }

    Log.i("ShareToCleanApp", "share_invoked platform=android payload=${report.payloadType()}")
    executor.execute {
      val repository = ShareSubmissionRepository()
      val context = store.loadContext()
      try {
        repository.submitOrThrow(report, context)
        Log.i("ShareToCleanApp", "share_submit_succeeded id=${report.id}")
      } catch (error: Exception) {
        Log.w("ShareToCleanApp", "share_submit_failed id=${report.id} error=${error.message}")
        store.saveDraft(report.copy(submissionState = "failed", failureReason = error.message))
        enqueueRetry()
        Log.i("ShareToCleanApp", "share_queued_for_retry id=${report.id}")
      } finally {
        runOnUiThread { finish() }
      }
    }
  }

  private fun enqueueRetry() {
    val request =
      OneTimeWorkRequestBuilder<PendingShareWorker>()
        .setConstraints(
          Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build(),
        )
        .build()
    WorkManager.getInstance(applicationContext)
      .enqueueUniqueWork("cleanapp-pending-share-retry", ExistingWorkPolicy.KEEP, request)
  }

  override fun onDestroy() {
    executor.shutdown()
    super.onDestroy()
  }
}
