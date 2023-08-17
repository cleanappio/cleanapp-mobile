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
  getCacheVault,
  getMapLocation,
  getPlayers,
  getGuilds,
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
import {WalletConnectProvider} from '@walletconnect/react-native-dapp/dist/providers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapboxGL from '@rnmapbox/maps';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import Config from 'react-native-config';
import {getLocation} from './src/functions/geolocation';
import {getReverseGeocodingData} from './src/services/API/MapboxAPI';
import {useFocusEffect} from '@react-navigation/native';
import {FABCameraButton} from './src/components/FABCameraButton';

getWeb3_.catch((err) => {
  //console.warn('Error in web3 initialization.', err));
});
MapboxGL.setAccessToken(Config.MAPBOX_ACCESS_TOKEN);

const persistor = persistStore(store);

const RootNavigator = () => {
  useEffect(() => {
    checkLanguage();
    checkStatus();
    checkDataUsageSettings();
    checkVerifySettings();
    checkCacheVault();
    checkMapLocation();
    checkPlayers();
    checkGuilds();
  }, []);

  const [{progressSettings, alertSettings, fabShow}, dispatch] =
    useStateValue();
  const {show = false} = progressSettings || {};
  const {settings} = alertSettings || {};

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

  const checkCacheVault = async () => {
    const cacheVault = await getCacheVault();
    dispatch({
      type: actions.SET_CACHE_VAULT,
      cacheVault: cacheVault,
    });
  };

  const checkMapLocation = async () => {
    const mapLocation = await getMapLocation();
    dispatch({
      type: actions.SET_MAP_LOCATION,
      mapLocation: mapLocation,
    });
  };

  const checkPlayers = async () => {
    const players = await getPlayers();
    dispatch({
      type: actions.SET_PLAYERS,
      players: players,
    });
  };

  const checkGuilds = async () => {
    const guilds = await getGuilds();
    dispatch({
      type: actions.SET_GUILDS,
      guilds: guilds,
    });
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
        {fabShow && <FABCameraButton dispatch={dispatch} />}
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
