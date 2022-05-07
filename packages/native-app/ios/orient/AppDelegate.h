#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <UMCore/UMAppDelegateWrapper.h>
#import <Firebase.h>

@interface AppDelegate : UMAppDelegateWrapper <UIApplicationDelegate, RCTBridgeDelegate>

@property(nonatomic, strong) UIWindow *window;

@end
