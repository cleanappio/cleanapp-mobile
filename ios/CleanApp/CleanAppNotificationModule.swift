import Foundation
import UserNotifications
import UIKit
import React

@objc(CleanAppNotificationModule)
class CleanAppNotificationModule: NSObject {
  private static var pendingRegisterResolve: RCTPromiseResolveBlock?
  private static var pendingRegisterReject: RCTPromiseRejectBlock?

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc(registerForRemoteNotifications:resolver:rejecter:)
  func registerForRemoteNotifications(
    _ config: NSDictionary?,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      CleanAppNotificationModule.pendingRegisterResolve = resolve
      CleanAppNotificationModule.pendingRegisterReject = reject
      UIApplication.shared.registerForRemoteNotifications()
    }
  }

  @objc(unregisterRemoteNotifications:resolver:rejecter:)
  func unregisterRemoteNotifications(
    _ config: NSDictionary?,
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
    content.sound = UNNotificationSound.default
    content.userInfo = userInfo as? [AnyHashable: Any] ?? [:]

    let identifier = (userInfo["notification_id"] as? String) ?? UUID().uuidString
    let request = UNNotificationRequest(
      identifier: identifier,
      content: content,
      trigger: nil
    )

    UNUserNotificationCenter.current().add(request) { error in
      if let error = error {
        reject("notification_error", error.localizedDescription, error)
        return
      }

      resolve(true)
    }
  }

  @objc
  static func handleRemoteRegistrationSuccess(_ deviceToken: Data) {
    let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()

    DispatchQueue.main.async {
      pendingRegisterResolve?([
        "provider": "apns",
        "token": token,
        "notificationsEnabled": true,
      ])
      pendingRegisterResolve = nil
      pendingRegisterReject = nil
    }
  }

  @objc
  static func handleRemoteRegistrationFailure(_ error: Error) {
    DispatchQueue.main.async {
      pendingRegisterReject?("remote_notification_error", error.localizedDescription, error)
      pendingRegisterResolve = nil
      pendingRegisterReject = nil
    }
  }
}
