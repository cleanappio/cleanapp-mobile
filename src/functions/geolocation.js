import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform} from 'react-native';
import {setUserLocation} from '../services/DataManager';

/**
 * Request permission and get the user's location.
 * Currently settings the result in async storage.
 */
export const getLocation = async (userData, navigation) => {
  return new Promise(async (resolve, reject) => {
    let auth;

    if (Platform.OS === 'android') {
      auth = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          message: 'This app needs access to your location',
          title: 'Location Permission',
          buttonPositive: '',
        },
      );
    } else if (Platform.OS === 'ios') {
      auth = await Geolocation.requestAuthorization('whenInUse');
    }

    if (auth === 'granted') {
      return Geolocation.getCurrentPosition(
        (position) => {
          const {latitude, longitude} = position.coords;

          if (navigation) {
            setUserLocation({longitude: longitude, latitude: latitude});
            resolve({latitude: latitude, longitude: longitude});
          } else {
            setUserLocation({longitude: longitude, latitude: latitude});
            resolve({latitude: latitude, longitude: longitude});
          }
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
      resolve(false);
    }
  });
};
