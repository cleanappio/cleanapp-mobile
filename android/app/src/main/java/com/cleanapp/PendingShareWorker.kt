package com.cleanapp

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class PendingShareWorker(
  appContext: Context,
  workerParams: WorkerParameters,
) : CoroutineWorker(appContext, workerParams) {
  override suspend fun doWork(): Result {
    val store = PendingShareStore(applicationContext)
    val repository = ShareSubmissionRepository()
    val context = store.loadContext()
    val drafts = store.loadDrafts()

    if (drafts.isEmpty()) {
      return Result.success()
    }

    var anyFailure = false
    drafts.forEach { draft ->
      try {
        repository.submitOrThrow(draft, context)
        store.removeDraft(draft)
        Log.i("ShareToCleanApp", "share_retry_succeeded id=${draft.id}")
      } catch (error: Exception) {
        anyFailure = true
        Log.w("ShareToCleanApp", "share_retry_failed id=${draft.id} error=${error.message}")
      }
    }

    return if (anyFailure) Result.retry() else Result.success()
  }
}
