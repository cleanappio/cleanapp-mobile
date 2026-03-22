package com.cleanapp

import android.app.Activity
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.Executors

class ShareReceiverActivity : Activity() {
  private val executor = Executors.newSingleThreadExecutor()
  private lateinit var spinner: ProgressBar
  private lateinit var successView: TextView

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val root = FrameLayout(this)
    spinner = ProgressBar(this)
    root.addView(
      spinner,
      FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.WRAP_CONTENT,
        FrameLayout.LayoutParams.WRAP_CONTENT,
      ).apply {
        gravity = Gravity.CENTER
      },
    )

    successView =
      TextView(this).apply {
        text = "✓"
        textSize = 56f
        setTextColor(Color.parseColor("#22C55E"))
        gravity = Gravity.CENTER
        alpha = 0f
      }
    root.addView(
      successView,
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
        val submissionResult = repository.submitOrThrow(report, context)
        store.recordSuccessfulSubmission(report, submissionResult)
        Log.i("ShareToCleanApp", "share_submit_succeeded id=${report.id}")
        runOnUiThread { showSuccessAndFinish() }
      } catch (error: Exception) {
        Log.w("ShareToCleanApp", "share_submit_failed id=${report.id} error=${error.message}")
        store.saveDraft(report.copy(submissionState = "failed", failureReason = error.message))
        enqueueRetry()
        Log.i("ShareToCleanApp", "share_queued_for_retry id=${report.id}")
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

  private fun showSuccessAndFinish() {
    spinner.alpha = 0f
    successView.animate()
      .alpha(1f)
      .scaleX(1.08f)
      .scaleY(1.08f)
      .setDuration(140)
      .withEndAction {
        successView.postDelayed({
          finish()
        }, 500)
      }
      .start()
  }

  override fun onDestroy() {
    executor.shutdown()
    super.onDestroy()
  }
}
