#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CleanAppShareModule, NSObject)

RCT_EXTERN_METHOD(syncShareContext:(NSDictionary *)payload
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(retryPendingSharedDrafts:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
