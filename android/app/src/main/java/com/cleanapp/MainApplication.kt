package com.cleanapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              add(CleanAppNotificationPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    ensureDefaultFirebaseApp()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
  }

  private fun ensureDefaultFirebaseApp() {
    if (FirebaseApp.getApps(this).isNotEmpty()) {
      return
    }

    val applicationId = BuildConfig.FCM_APPLICATION_ID.trim()
    val apiKey = BuildConfig.FCM_API_KEY.trim()
    val projectId = BuildConfig.FCM_PROJECT_ID.trim()
    val gcmSenderId = BuildConfig.FCM_GCM_SENDER_ID.trim()

    if (
      applicationId.isBlank() ||
        apiKey.isBlank() ||
        projectId.isBlank() ||
        gcmSenderId.isBlank()
    ) {
      return
    }

    val optionsBuilder =
      FirebaseOptions.Builder()
        .setApplicationId(applicationId)
        .setApiKey(apiKey)
        .setProjectId(projectId)
        .setGcmSenderId(gcmSenderId)

    val storageBucket = BuildConfig.FCM_STORAGE_BUCKET.trim()
    if (storageBucket.isNotBlank()) {
      optionsBuilder.setStorageBucket(storageBucket)
    }

    FirebaseApp.initializeApp(this, optionsBuilder.build())
  }
}
