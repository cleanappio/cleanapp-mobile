#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CleanAppNotificationModule, NSObject)

RCT_EXTERN_METHOD(
  registerForRemoteNotifications:(NSDictionary *)config
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  unregisterRemoteNotifications:(NSDictionary *)config
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  presentLocalNotification:(NSString *)title
  body:(NSString *)body
  userInfo:(NSDictionary *)userInfo
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

@end
