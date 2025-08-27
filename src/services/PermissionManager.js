import {Platform} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

class PermissionManager {
  // Location Permissions
  static async requestLocationPermission() {
    try {
      let permission;

      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }

      const result = await check(permission);

      if (result === RESULTS.UNAVAILABLE) {
        return {granted: false, reason: 'unavailable'};
      }

      if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        return {
          granted: requestResult === RESULTS.GRANTED,
          reason: requestResult,
        };
      }

      if (result === RESULTS.BLOCKED) {
        return {granted: false, reason: 'blocked'};
      }

      return {granted: result === RESULTS.GRANTED, reason: result};
    } catch (error) {
      return {granted: false, reason: 'error', error};
    }
  }

  // Camera Permissions
  static async requestCameraPermission() {
    try {
      let permission;

      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.CAMERA;
      } else {
        permission = PERMISSIONS.ANDROID.CAMERA;
      }

      const result = await check(permission);

      if (result === RESULTS.UNAVAILABLE) {
        return {granted: false, reason: 'unavailable'};
      }

      if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        return {
          granted: requestResult === RESULTS.GRANTED,
          reason: requestResult,
        };
      }

      if (result === RESULTS.BLOCKED) {
        return {granted: false, reason: 'blocked'};
      }

      return {granted: result === RESULTS.GRANTED, reason: result};
    } catch (error) {
      console.error('Camera permission error:', error);
      return {granted: false, reason: 'error', error};
    }
  }

  // Check camera permission without requesting
  static async checkCameraPermission() {
    try {
      let permission;

      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.CAMERA;
      } else {
        permission = PERMISSIONS.ANDROID.CAMERA;
      }

      const result = await check(permission);
      return {granted: result === RESULTS.GRANTED, reason: result};
    } catch (error) {
      console.error('Check camera permission error:', error);
      return {granted: false, reason: 'error', error};
    }
  }

  // Notification Permissions (iOS 13+ and Android 13+)
  static async requestNotificationPermission() {
    try {
      let permission;

      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.NOTIFICATIONS;
      } else {
        // Android 13+ (API level 33+)
        if (Platform.Version >= 33) {
          permission = PERMISSIONS.ANDROID.POST_NOTIFICATIONS;
        } else {
          return {granted: true, reason: 'not_required'};
        }
      }

      const result = await check(permission);

      if (result === RESULTS.UNAVAILABLE) {
        return {granted: false, reason: 'unavailable'};
      }

      if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        return {
          granted: requestResult === RESULTS.GRANTED,
          reason: requestResult,
        };
      }

      if (result === RESULTS.BLOCKED) {
        return {granted: false, reason: 'blocked'};
      }

      return {granted: result === RESULTS.GRANTED, reason: result};
    } catch (error) {
      return {granted: false, reason: 'error', error};
    }
  }

  // Check all permissions at once
  static async checkAllPermissions() {
    const [location, camera, notifications] = await Promise.all([
      this.requestLocationPermission(),
      this.requestCameraPermission(),
      this.requestNotificationPermission(),
    ]);

    return {
      location,
      camera,
      notifications,
      allGranted: location.granted && camera.granted && notifications.granted,
    };
  }

  // Open app settings
  static openSettings() {
    openSettings();
  }
}

export default PermissionManager;
