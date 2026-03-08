import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "CleanApp"
    self.dependencyProvider = RCTAppDependencyProvider()

    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = [:]

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    let provider = RCTBundleURLProvider.sharedSettings()
    // Ensure we always have a packager host; avoids "No script URL provided"
    if provider.jsLocation == nil || provider.jsLocation?.isEmpty == true {
      provider.jsLocation = "localhost:8081"
    }
    if let url = provider.jsBundleURL(forBundleRoot: "index") {
      return url
    }
    // Hard fallback if provider still returns nil
    return URL(string: "http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
