import Foundation
import React
import UIKit
import UserNotifications

@objc(CleanAppNotificationModule)
class CleanAppNotificationModule: RCTEventEmitter {
  private static var pendingRegisterResolve: RCTPromiseResolveBlock?
  private static var pendingRegisterReject: RCTPromiseRejectBlock?
  private static weak var currentModule: CleanAppNotificationModule?
  private static var pendingInitialNotification: [String: Any]?
  private static var hasJSListeners = false

  override init() {
    super.init()
    CleanAppNotificationModule.currentModule = self
  }

  override static func requiresMainQueueSetup() -> Bool {
    true
  }

  override func supportedEvents() -> [String]! {
    ["notificationOpened"]
  }

  override func startObserving() {
    CleanAppNotificationModule.hasJSListeners = true
  }

  override func stopObserving() {
    CleanAppNotificationModule.hasJSListeners = false
  }

  @objc(registerForRemoteNotifications:resolver:rejecter:)
  func registerForRemoteNotifications(
    _ config: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      let center = UNUserNotificationCenter.current()
      center.requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
        if let error = error {
          reject("notification_error", error.localizedDescription, error)
          return
        }

        guard granted else {
          resolve([
            "provider": "apns",
            "notificationsEnabled": false,
            "reason": "permission_denied",
          ])
          return
        }

        CleanAppNotificationModule.pendingRegisterResolve = resolve
        CleanAppNotificationModule.pendingRegisterReject = reject
        UIApplication.shared.registerForRemoteNotifications()
      }
    }
  }

  @objc(unregisterRemoteNotifications:resolver:rejecter:)
  func unregisterRemoteNotifications(
    _ config: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      UIApplication.shared.unregisterForRemoteNotifications()
      resolve(true)
    }
  }

  @objc(presentLocalNotification:body:userInfo:resolver:rejecter:)
  func presentLocalNotification(
    _ title: String,
    body: String,
    userInfo: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default
    content.userInfo = userInfo as? [AnyHashable: Any] ?? [:]

    let explicitRequestID = (userInfo["notification_id"] as? String)?
      .trimmingCharacters(in: .whitespacesAndNewlines)
    let requestID = (explicitRequestID?.isEmpty == false ? explicitRequestID! : UUID().uuidString)

    let request = UNNotificationRequest(identifier: requestID, content: content, trigger: nil)
    UNUserNotificationCenter.current().add(request) { error in
      if let error = error {
        reject("notification_error", error.localizedDescription, error)
        return
      }
      resolve(true)
    }
  }

  @objc(getInitialNotification:rejecter:)
  func getInitialNotification(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    resolve(CleanAppNotificationModule.pendingInitialNotification)
  }

  @objc(clearInitialNotification)
  func clearInitialNotification() {
    CleanAppNotificationModule.pendingInitialNotification = nil
  }

  @objc
  static func handleRemoteRegistrationSuccess(_ deviceToken: Data) {
    let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
    pendingRegisterResolve?([
      "provider": "apns",
      "token": token,
      "notificationsEnabled": true,
    ])
    pendingRegisterResolve = nil
    pendingRegisterReject = nil
  }

  @objc
  static func handleRemoteRegistrationFailure(_ error: Error) {
    pendingRegisterReject?("remote_notification_error", error.localizedDescription, error)
    pendingRegisterResolve = nil
    pendingRegisterReject = nil
  }

  @objc
  static func handleNotificationOpen(_ userInfo: [AnyHashable: Any]) {
    let payload = normalizeNotificationPayload(userInfo)
    guard !payload.isEmpty else {
      return
    }

    pendingInitialNotification = payload
    guard hasJSListeners, let module = currentModule else {
      return
    }

    DispatchQueue.main.async {
      module.sendEvent(withName: "notificationOpened", body: payload)
    }
  }

  private static func normalizeNotificationPayload(_ userInfo: [AnyHashable: Any]) -> [String: Any] {
    var payload = [String: Any]()

    if let nested = userInfo["cleanapp"] as? [String: Any] {
      for (key, value) in nested where !(value is NSNull) {
        payload[key] = value
      }
    } else if let nested = userInfo["cleanapp"] as? [AnyHashable: Any] {
      for (rawKey, value) in nested where !(value is NSNull) {
        if let key = rawKey as? String {
          payload[key] = value
        }
      }
    }

    let directKeys = [
      "seq",
      "public_id",
      "status",
      "recipient_email",
      "recipient_name",
      "sent_at",
      "navigate_to",
      "notification_id",
    ]

    for key in directKeys where payload[key] == nil {
      if let value = userInfo[key], !(value is NSNull) {
        payload[key] = value
      }
    }

    return payload
  }
}
