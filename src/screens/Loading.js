/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {Text, Image, View} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {styles} from '../styles/loading';
import {LoginFromWalletConnect, LoginProc} from '../functions/login';
import {withTranslation} from 'react-i18next';
import {
  getAuthToken,
  getFirstRun,
  getUserName,
  getWalletType,
} from '../services/DataManager';
import {refreshTokenAPI} from '../services/API/CoreAPICalls';
import {
  useWalletConnect,
  withWalletConnect,
} from '@walletconnect/react-native-dapp';
import {default as AsyncStorage} from '@react-native-async-storage/async-storage';

import {default as LoadingBG} from '../assets/loading_bg.svg';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../services/Common/theme';

const cleanappIcon = require('../assets/CleanApp_Logo.png');

const Loading = ({t, navigation}) => {
  const web3 = useSelector((state) => state.web3);
  const connector = useWalletConnect();
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const navigateHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Home'}],
      }),
    );
  };

  const navigateOnboarding = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Onboarding'}],
      }),
    );
  };

  // function login
  // if authtoken already set, then use them
  // else call LoginProc
  const wclogin = async () => {
    await LoginFromWalletConnect(connector, web3);
    // move to Home Screen
    navigateHome();
  };

  const login = async () => {
    if (!isConnected) {
      setIsConnected(true);

      setTimeout(async () => {
        const token = await refreshTokenAPI();
        // no auth token set, call LoginProc
        if (!token || !token.access_token) {
          const walletType = await getWalletType();

          if (walletType === 'WalletConnect') {
            connector.connect().then((response) => {
              // if wc connect succussfully, run loginProc
              if (
                response &&
                response.accounts &&
                response.accounts.length > 0
              ) {
                setIsChecking(true);
              } else {
                // retry wc
                setIsConnected(false);
              }
            });
          } else {
            await LoginProc(web3);
            navigateHome();
          }
        } else {
          navigateHome();
        }
      }, 2000);
    }
  };

  useEffect(() => {
    getFirstRun().then((ret) => {
      if (ret && ret.firstRun) {
        login();
      } else {
        setTimeout(() => {
          navigateOnboarding();
        }, 2000);
      }
    });
  }, []);

  useEffect(() => {
    if (isChecking) {
      wclogin();
    }
  }, [isChecking]);

  return (
    <View style={styles.container}>
      <Image source={cleanappIcon} style={styles.image2} resizeMode="contain" />
    </View>
  );
};

export default withTranslation()(Loading);
