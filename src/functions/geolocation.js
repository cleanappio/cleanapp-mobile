import Geolocation from 'react-native-geolocation-service';
import {Alert, Platform} from 'react-native';
import {setUserLocation} from '../services/DataManager';
import {getReverseGeocodingData} from '../services/API/MapboxAPI';
import {
  PERMISSIONS,
  RESULTS,
  check,
  openSettings,
  request,
} from 'react-native-permissions';
import FlashMessage, {showMessage} from 'react-native-flash-message';
/**
 * Request permission and get the user's location.
 * Currently settings the result in async storage.
 */
export const getLocation = async () => {
  return new Promise(async (resolve, reject) => {
    let permissionCheck = '';
    let permissionRequest = RESULTS.GRANTED;

    if (Platform.OS === 'ios') {
      permissionCheck = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

      if (permissionCheck !== RESULTS.GRANTED) {
        permissionRequest = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      }
    }

    if (Platform.OS === 'android') {
      permissionCheck = await check(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);

      if (permissionCheck !== RESULTS.GRANTED) {
        permissionRequest = await request(
          PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        );
      }
    }

    if (permissionRequest === RESULTS.GRANTED) {
      return Geolocation.getCurrentPosition(
        async (position) => {
          const {latitude, longitude} = position.coords;
          
          const locInfo = {
            longitude: longitude,
            latitude: latitude,
            //location: locationStr,
            //city: cityStr,
          };
          setUserLocation(locInfo);
          resolve(locInfo);
        },
        (error) => {
          resolve(false);
        },
        {
          accuracy: {
            android: 'high',
            ios: 'best',
          },
          enableHighAccuracy: false,
          maximumAge: 0,
          timeout: 15000,
        },
      );
    } else {
      // not granted
      Alert.alert(
        'Notice',
        'Location permission not granted. Will you go to Settings and grant permission?',
        [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Confirm',
            onPress: () => {
              openSettings();
            },
          },
        ],
      );
      resolve(false);
    }
  });
};
