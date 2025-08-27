import {Platform} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import notifee, {
  AuthorizationStatus,
  AndroidImportance,
} from '@notifee/react-native';

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

  // Notification Permissions using notifee
  static async requestNotificationPermission() {
    try {
      // Request permission using notifee
      const settings = await notifee.requestPermission();

      // Log the authorization status
      if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
        console.log('User denied notification permissions request');
        return {granted: false, reason: 'denied'};
      } else if (
        settings.authorizationStatus === AuthorizationStatus.AUTHORIZED
      ) {
        console.log('User granted notification permissions request');
        return {granted: true, reason: 'granted'};
      } else if (
        settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
      ) {
        console.log(
          'User provisionally granted notification permissions request',
        );
        return {granted: true, reason: 'provisional'};
      } else if (
        settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED
      ) {
        console.log('Notification permission not determined');
        return {granted: false, reason: 'not_determined'};
      }

      // Fallback: check system permission status
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
      return {granted: result === RESULTS.GRANTED, reason: result};
    } catch (error) {
      console.error('Notification permission error:', error);
      return {granted: false, reason: 'error', error};
    }
  }

  // Check notification permission status without requesting
  static async checkNotificationPermission() {
    try {
      // Check current notification settings
      const settings = await notifee.getNotificationSettings();

      if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        return {granted: true, reason: 'authorized'};
      } else if (
        settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
      ) {
        return {granted: true, reason: 'provisional'};
      } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
        return {granted: false, reason: 'denied'};
      } else if (
        settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED
      ) {
        return {granted: false, reason: 'not_determined'};
      }

      return {granted: false, reason: 'unknown'};
    } catch (error) {
      console.error('Check notification permission error:', error);
      return {granted: false, reason: 'error', error};
    }
  }

  // Check all permissions at once
  static async checkAllPermissions() {
    const [location, camera, notifications] = await Promise.all([
      this.requestLocationPermission(),
      this.requestCameraPermission(),
      this.checkNotificationPermission(), // Use check instead of request to avoid prompting
    ]);

    return {
      location,
      camera,
      notifications,
      allGranted: location.granted && camera.granted && notifications.granted,
    };
  }

  // Request all permissions at once (use this when you want to prompt user)
  static async requestAllPermissions() {
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

  // Create notification channel for Android (required for notifications to work)
  static async createNotificationChannel() {
    if (Platform.OS === 'android') {
      try {
        const channelId = await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          sound: 'default',
          importance: AndroidImportance.HIGH,
        });
        console.log('Notification channel created:', channelId);
        return channelId;
      } catch (error) {
        console.error('Error creating notification channel:', error);
        return null;
      }
    }
    return null;
  }

  // Initialize notification system
  static async initializeNotifications() {
    try {
      // Create notification channel for Android
      await this.createNotificationChannel();

      // Check current notification settings
      const settings = await this.checkNotificationPermission();
      console.log('Notification settings:', settings);

      return settings;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return {granted: false, reason: 'error', error};
    }
  }
}

export default PermissionManager;
