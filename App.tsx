/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import 'react-native-screens';
import { enableScreens } from 'react-native-screens';
import {
  StatusBar,
  NativeModules,
  Platform,
} from 'react-native';
import React, {useEffect} from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CreateRootNavigator from './src/index';
import {StateProvider} from './src/services/State/State.js';
import {initialState} from './src/services/State/InitialState.js';
import {reducer, actions} from './src/services/State/Reducer.js';
import {useStateValue} from './src/services/State/State.js';
import {theme} from './src/services/Common/theme.js';
import {
  getLanguage,
  getUserInfo,
  getDataUsageFlag,
  isPrivacyAndTermsAccepted,
  getCacheVault,
  getMapLocation,
  getPlayers,
  getGuilds,
} from './src/services/DataManager.js';
import {store} from './src/store/store.js';
import {Provider} from 'react-redux';
// import {persistStore} from 'redux-persist';
import i18next from 'i18next';
import {I18nextProvider} from 'react-i18next';
import {MenuProvider} from 'react-native-popup-menu';
import {ethers} from 'ethers';
import SplashScreen from 'react-native-splash-screen';

enableScreens();

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

  return (
    <SafeAreaProvider style={{flex: 1, backgroundColor: theme.APP_COLOR_1}}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.APP_COLOR_1}
      />
      <CreateRootNavigator />
    </SafeAreaProvider>
  );
};

const App = () => {
  const fetcher = ['ethers', {ethers, provider: ethers.getDefaultProvider()}];

  useEffect(() => {
    SplashScreen.hide();
  });
  return (
    <Provider store={store}>
      <StateProvider initialState={initialState} reducer={reducer}>
        <MenuProvider>
          <I18nextProvider i18n={i18next}>
            <RootNavigator />
          </I18nextProvider>
        </MenuProvider>
      </StateProvider>
    </Provider>
  );
};

export default App;
