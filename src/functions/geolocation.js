import Geolocation from 'react-native-geolocation-service';
import {Alert, Platform} from 'react-native';
import {setUserLocation} from '../services/DataManager';
import {
  PERMISSIONS,
  RESULTS,
  check,
  openSettings,
  request,
} from 'react-native-permissions';

// Session-level flag: ensures we only show the "go to Settings" alert once
// per app launch. Resets naturally when the app is killed and restarted.
let hasShownPermissionAlert = false;

/**
 * Request permission and get the user's location.
 * - First call: checks status, requests if needed, shows alert if blocked.
 * - Subsequent calls: silently returns false if permission was denied/blocked,
 *   never re-prompts the user.
 */
export const getLocation = async () => {
  return new Promise(async (resolve, reject) => {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    let status = await check(permission);

    // If not yet granted, attempt to request (only works if status is DENIED,
    // i.e. the user has never been asked before). On iOS, once the user
    // explicitly denies, status becomes BLOCKED and request() is a no-op.
    if (status === RESULTS.DENIED) {
      status = await request(permission);
    }

    if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
      return Geolocation.getCurrentPosition(
        async (position) => {
          const {latitude, longitude} = position.coords;

          const locInfo = {
            longitude: longitude,
            latitude: latitude,
          };
          setUserLocation(locInfo);
          resolve(locInfo);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          resolve(false);
        },
        {
          forceLocationManager: true,
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 30000,
          distanceFilter: 0,
        },
      );
    }

    // Permission is BLOCKED or UNAVAILABLE.
    // Show the "go to Settings" alert only ONCE per app session.
    if (!hasShownPermissionAlert) {
      hasShownPermissionAlert = true;
      Alert.alert(
        'Location Required',
        'CleanApp needs your location to tag reports. Please enable it in Settings.',
        [
          {
            text: 'Not Now',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: () => {
              openSettings();
            },
          },
        ],
      );
    }
    resolve(false);
  });
};
