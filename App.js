/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import {
  SafeAreaView,
  StatusBar,
  LogBox,
  NativeModules,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CreateRootNavigator from './src/index';
import {StateProvider} from './src/services/State/State';
import {initialState} from './src/services/State/InitialState';
import {reducer, actions} from './src/services/State/Reducer';
import {useStateValue} from './src/services/State/State';
import ModalActivityIndicator from './src/components/ModalActivityIndicator';
import AppAlert from './src/components/AppAlert';
import {theme} from './src/services/Common/theme';
import {
  getLanguage,
  getUserInfo,
  getDataUsageFlag,
  isPrivacyAndTermsAccepted,
  getCurrencySettings,
} from './src/services/DataManager';
import {store} from './src/store/store.js';
import {getWeb3_} from './src/web3/getWeb3';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import i18next from 'i18next';
import {I18nextProvider} from 'react-i18next';
import {MenuProvider} from 'react-native-popup-menu';
import {ethers} from 'ethers';
import {NftProvider} from 'use-nft';

// 1. Import the modules.
import BackgroundFetch from 'react-native-background-fetch';
import {getNotifications} from './src/services/API/APIManager';
import NotifService from './NotifService';
import {WalletConnectProvider} from '@walletconnect/react-native-dapp/dist/providers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapboxGL from '@rnmapbox/maps';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import Config from 'react-native-config';
import {getLocation} from './src/functions/geolocation';
import {getReverseGeocodingData} from './src/services/API/MapboxAPI';

getWeb3_.catch((err) => {
  //console.warn('Error in web3 initialization.', err));
});
MapboxGL.setAccessToken(Config.MAPBOX_ACCESS_TOKEN);

const persistor = persistStore(store);

const RootNavigator = () => {
  const onRegister = (token) => {};

  const onNotif = (notif) => {};

  const notif = new NotifService(onRegister, onNotif);

  useEffect(() => {
    checkLanguage();
    checkStatus();
    checkDataUsageSettings();
    checkVerifySettings();
    fetchNotification();
    fetchTask();

    checkUserLocation();
    //handleLocationPermission();
  }, []);

  const checkUserLocation = async () => {
    const location = await getLocation();
    let locationStr = '';
    let cityStr = '';
    if (location && location.latitude) {
      const locStr = await getReverseGeocodingData(
        [location.longitude, location.latitude],
        true,
      );
      if (locStr && locStr.features) {
        const features = locStr.features;
        if (features.length > 0) {
          locationStr = features[0].context.find((context) =>
            context.id.startsWith('locality.'),
          ).text;
          cityStr = features[0].context.find((context) =>
            context.id.startsWith('place.'),
          ).text;
        }
      }
    }

    dispatch({
      type: actions.SET_USER_LOCATION,
      userLocation: {...location, location: locationStr, city: cityStr},
    });
  };

  const handleLocationPermission = async () => {
    let permissionCheck = '';
    if (Platform.OS === 'ios') {
      permissionCheck = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

      if (
        permissionCheck === RESULTS.BLOCKED ||
        permissionCheck === RESULTS.DENIED
      ) {
        const permissionRequest = await request(
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        );
        permissionRequest === RESULTS.GRANTED
          ? console.warn('Location permission granted.')
          : console.warn('location permission denied.');
      }
    }

    if (Platform.OS === 'android') {
      permissionCheck = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

      if (
        permissionCheck === RESULTS.BLOCKED ||
        permissionCheck === RESULTS.DENIED
      ) {
        const permissionRequest = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        );
        permissionRequest === RESULTS.GRANTED
          ? console.warn('Location permission granted.')
          : console.warn('location permission denied.');
      }
    }
  };

  const [{progressSettings, alertSettings}, dispatch] = useStateValue();
  const {show = false} = progressSettings || {};
  const {settings} = alertSettings || {};

  const fetchTask = async () => {
    const notifications = await getNotifications({mark_as_read: true});

    if (notifications && notifications.length > 0) {
      // 4. Send a push notification
      notifications.forEach((ele) => {
        let title = ele.data.title;
        let message = ele.data.message;
        if (ele.type === 'rank_updated') {
          message = `Your Rank updated from ${ele.data['old-rank']}th to ${ele.data['new-rank']}th`;
        }

        notif.localNotif('', title, message);
      });
    }
  };

  const fetchNotificationTask = async (taskId) => {
    fetchTask();

    // Call finish upon completion of the background task
    BackgroundFetch.finish(taskId);
  };

  const fetchNotification = async () => {
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // in minutes
      },
      fetchNotificationTask,
      (error) => {
        // console.error('RNBackgroundFetch failed to start.');
      },
    );

    setInterval(() => {
      fetchTask();
    }, 1000 * 60 * 15);
  };

  const checkDataUsageSettings = async () => {
    let isDataUsageAvailable = await getDataUsageFlag();
    dispatch({
      type: actions.SET_DATAUSAGE,
      dataUsageSettings: isDataUsageAvailable,
    });
  };

  const checkVerifySettings = async () => {
    let verifyAvailable = await isPrivacyAndTermsAccepted();
    dispatch({
      type: actions.SET_VERIFYSETTING,
      verifySettings: verifyAvailable,
    });
  };

  const checkLanguage = async () => {
    let language = await getLanguage();
    if (!language) {
      const deviceLanguage =
        Platform.OS === 'ios'
          ? NativeModules.SettingsManager.settings.AppleLocale || //iOS 13
            NativeModules.SettingsManager.settings.AppleLanguages[0]
          : NativeModules.I18nManager.localeIdentifier;
      language = deviceLanguage.split('_')[0];
    }
    await i18next.changeLanguage(language);
    dispatch({
      type: actions.SET_LANGUAGE,
      selectedLanguage: language,
    });
  };

  const checkStatus = async () => {
    try {
      const userInfo = await getUserInfo();
      if (userInfo && userInfo.id) {
        dispatch({
          type: actions.SET_USER,
          user: userInfo,
        });
      } else {
        dispatch({
          type: actions.SET_USER,
          user: '',
        });
      }
    } catch (err) {}
  };

  const getAlertSettings = () => {
    const onConfirmPressed =
        settings && settings.onConfirmPressed
          ? settings.onConfirmPressed
          : () => {},
      onCancelPressed =
        settings && settings.onCancelPressed
          ? settings.onCancelPressed
          : () => {};
    return {
      ...settings,
      onConfirmPressed: () => {
        dispatch({
          type: actions.SET_ALERT_SETTINGS,
          alertSettings: null,
        });
        onConfirmPressed();
      },
      onCancelPressed: () => {
        dispatch({
          type: actions.SET_ALERT_SETTINGS,
          alertSettings: null,
        });
        onCancelPressed();
      },
    };
  };

  return (
    <>
      <SafeAreaView style={{flex: 0, backgroundColor: theme.APP_COLOR_1}} />
      <SafeAreaView style={{flex: 1, backgroundColor: theme.APP_COLOR_1}}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.APP_COLOR_1}
        />
        <AppAlert {...getAlertSettings()} />
        <ModalActivityIndicator modalVisible={show} />
        <CreateRootNavigator />
      </SafeAreaView>
    </>
  );
};

const App = () => {
  const fetcher = ['ethers', {ethers, provider: ethers.getDefaultProvider()}];

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NftProvider fetcher={fetcher}>
          <StateProvider initialState={initialState} reducer={reducer}>
            <WalletConnectProvider
              // @ts-ignore
              redirectUrl={
                Platform.OS === 'web' ? window.location.origin : 'cleanapp://'
              }
              storageOptions={{
                // @ts-ignore
                asyncStorage: AsyncStorage,
              }}>
              <MenuProvider>
                <I18nextProvider i18n={i18next}>
                  <RootNavigator />
                </I18nextProvider>
              </MenuProvider>
            </WalletConnectProvider>
          </StateProvider>
        </NftProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;

LogBox.ignoreAllLogs(true);
