/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {getFirstRun, getPrivacySetting, getUserName, getWalletAddress, isPrivacyAndTermsAccepted} from '../services/DataManager';
import {
  useWalletConnect,
} from '@walletconnect/react-native-dapp';
import { updateOrCreateUser, updatePrivacyAndTOC } from '../services/API/APIManager';

const FirstEntry = ({t, navigation}) => {
  const web3 = useSelector((state) => state.web3);
  const connector = useWalletConnect();

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


  useEffect(() => {
    getFirstRun().then(async (ret) => {
      if (ret && ret.firstRun) {
        const walletAddress = await getWalletAddress();
        const userAvatar = await getUserName();
        const privacySetting = await getPrivacySetting();
        const termAccepted = await isPrivacyAndTermsAccepted();
        await updateOrCreateUser(walletAddress, userAvatar.userName);
        await updatePrivacyAndTOC(
          walletAddress,
          privacySetting === 0 ? 'share_data_live' : 'not_share_data_live',
          termAccepted ? 'ACCEPTED' : 'REJECTED',
        );
        navigateHome();
      } else {
        navigateOnboarding();
      }
    });
  }, []);

  // An empty screen whch is never shown, jumps immediately to
  // either onboarding or main screen.
  return (
    <View />
  );
};

export default withTranslation()(FirstEntry);