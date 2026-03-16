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
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.messaging.FirebaseMessaging

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
  fun registerForRemoteNotifications(
    config: ReadableMap?,
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
        promise.resolve(
          Arguments.createMap().apply {
            putString("provider", "fcm")
            putBoolean("notificationsEnabled", false)
            putString("reason", "permission_denied")
          },
        )
        return
      }

      val firebaseApp = getOrInitializeFirebaseApp(config)
      if (firebaseApp == null) {
        promise.resolve(
          Arguments.createMap().apply {
            putString("provider", "fcm")
            putBoolean("notificationsEnabled", false)
            putString("reason", "missing_fcm_config")
          },
        )
        return
      }

      FirebaseMessaging.getInstance().token
        .addOnCompleteListener { task ->
          if (!task.isSuccessful) {
            promise.reject(
              "remote_notification_error",
              task.exception?.message ?: "Failed to get FCM token",
              task.exception,
            )
            return@addOnCompleteListener
          }

          promise.resolve(
            Arguments.createMap().apply {
              putString("provider", "fcm")
              putString("token", task.result ?: "")
              putBoolean("notificationsEnabled", true)
            },
          )
        }
    } catch (error: Exception) {
      promise.reject("notification_error", error.message, error)
    }
  }

  @ReactMethod
  fun unregisterRemoteNotifications(
    config: ReadableMap?,
    promise: Promise,
  ) {
    try {
      val firebaseApp = getOrInitializeFirebaseApp(config)
      if (firebaseApp == null) {
        promise.resolve(true)
        return
      }

      FirebaseMessaging.getInstance().deleteToken()
        .addOnCompleteListener { task ->
          if (!task.isSuccessful) {
            promise.reject(
              "remote_notification_error",
              task.exception?.message ?: "Failed to delete FCM token",
              task.exception,
            )
            return@addOnCompleteListener
          }

          promise.resolve(true)
        }
    } catch (error: Exception) {
      promise.reject("notification_error", error.message, error)
    }
  }

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

  private fun getOrInitializeFirebaseApp(config: ReadableMap?): FirebaseApp? {
    FirebaseApp.getApps(reactContext).firstOrNull { it.name == FirebaseApp.DEFAULT_APP_NAME }?.let {
      return it
    }

    FirebaseApp.getApps(reactContext).firstOrNull()?.let {
      return it
    }

    val applicationId = config?.getNullableString("applicationId").orEmpty()
    val apiKey = config?.getNullableString("apiKey").orEmpty()
    val projectId = config?.getNullableString("projectId").orEmpty()
    val gcmSenderId = config?.getNullableString("gcmSenderId").orEmpty()

    if (
      applicationId.isBlank() ||
        apiKey.isBlank() ||
        projectId.isBlank() ||
        gcmSenderId.isBlank()
    ) {
      return null
    }

    val optionsBuilder =
      FirebaseOptions.Builder()
        .setApplicationId(applicationId)
        .setApiKey(apiKey)
        .setProjectId(projectId)
        .setGcmSenderId(gcmSenderId)

    val storageBucket = config.getNullableString("storageBucket").orEmpty()
    if (storageBucket.isNotBlank()) {
      optionsBuilder.setStorageBucket(storageBucket)
    }

    return FirebaseApp.initializeApp(reactContext, optionsBuilder.build())
  }

  private fun ReadableMap?.getNullableString(key: String): String? {
    if (this == null || !this.hasKey(key) || this.isNull(key)) {
      return null
    }
    return this.getString(key)
  }
}
