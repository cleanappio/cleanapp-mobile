import Foundation
import UserNotifications
import React

@objc(CleanAppNotificationModule)
class CleanAppNotificationModule: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
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
}
