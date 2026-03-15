package com.cleanapp

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class CleanAppNotificationModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val CHANNEL_ID = "cleanapp_report_delivery"
    private const val CHANNEL_NAME = "Report delivery updates"
    private const val CHANNEL_DESCRIPTION =
      "Notifications when CleanApp finishes processing your reports."
  }

  override fun getName(): String = "CleanAppNotificationModule"

  @ReactMethod
  fun presentLocalNotification(
    title: String,
    body: String,
    userInfo: ReadableMap,
    promise: Promise,
  ) {
    try {
      ensureNotificationChannel()

      if (
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
          ContextCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.POST_NOTIFICATIONS,
          ) != PackageManager.PERMISSION_GRANTED
      ) {
        promise.resolve(false)
        return
      }

      val launchIntent =
        reactContext.packageManager.getLaunchIntentForPackage(reactContext.packageName)?.apply {
          flags = Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_SINGLE_TOP or
            Intent.FLAG_ACTIVITY_CLEAR_TOP

          val iterator = userInfo.entryIterator
          while (iterator.hasNext()) {
            val entry = iterator.next()
            val key = entry.key
            val value = entry.value
            when {
              value == null -> putExtra(key, "")
              value is String -> putExtra(key, value)
              value is Boolean -> putExtra(key, value)
              value is Int -> putExtra(key, value)
              value is Double -> putExtra(key, value)
              else -> putExtra(key, value.toString())
            }
          }
        }

      val pendingIntent =
        launchIntent?.let {
          PendingIntent.getActivity(
            reactContext,
            System.currentTimeMillis().toInt(),
            it,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
          )
        }

      val notificationId =
        if (userInfo.hasKey("notification_id")) {
          userInfo.getString("notification_id")?.hashCode() ?: System.currentTimeMillis().toInt()
        } else {
          System.currentTimeMillis().toInt()
        }

      val builder =
        NotificationCompat.Builder(reactContext, CHANNEL_ID)
          .setSmallIcon(R.mipmap.ic_launcher)
          .setContentTitle(title)
          .setContentText(body)
          .setStyle(NotificationCompat.BigTextStyle().bigText(body))
          .setPriority(NotificationCompat.PRIORITY_HIGH)
          .setAutoCancel(true)
          .setDefaults(NotificationCompat.DEFAULT_ALL)

      if (pendingIntent != null) {
        builder.setContentIntent(pendingIntent)
      }

      NotificationManagerCompat.from(reactContext).notify(notificationId, builder.build())
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("notification_error", error.message, error)
    }
  }

  private fun ensureNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val manager =
      reactContext.getSystemService(NotificationManager::class.java) ?: return
    val existingChannel = manager.getNotificationChannel(CHANNEL_ID)
    if (existingChannel != null) {
      return
    }

    val channel =
      NotificationChannel(
        CHANNEL_ID,
        CHANNEL_NAME,
        NotificationManager.IMPORTANCE_HIGH,
      ).apply {
        description = CHANNEL_DESCRIPTION
      }

    manager.createNotificationChannel(channel)
  }
}
