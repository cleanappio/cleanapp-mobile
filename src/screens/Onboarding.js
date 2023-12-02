/* eslint-disable react-hooks/exhaustive-deps */
import {StackActions} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import Ripple from '../components/Ripple';
import {LoginFromWalletConnect, GetOrCreateLocalWallet} from '../functions/login';
import {
  updateOrCreateUser,
  updatePrivacyAndTOC,
} from '../services/API/APIManager';
import {theme} from '../services/Common/theme';
import {
  getUserName,
  getWalletAddress,
  setFirstRun,
  setPrivacyAndTermsAccepted,
  setPrivacySetting,
  setUserName,
  getReferral,
  setReferral,
  setTeam,
} from '../services/DataManager';
import {fontFamilies} from '../utils/fontFamilies';
import {useWalletConnect} from '@walletconnect/react-native-dapp';
import { InProgress } from '../components/InProgress';

const background = require('../assets/onboard_background.jpg');

import CheckIcon from '../assets/btn_check.svg';
import UncheckIcon from '../assets/btn_uncheck.svg';
import {Row} from '../components/Row';
import { createLocalWallet } from '../functions/walletconnect';
import { TermsAndConditions } from './TermsAndConditions';
import { retrieveReferral } from '../functions/referral';

const steps = [/* 'walletSelect', */ 'name', 'privacy'];

const IndicatorView = ({step = 'walletSelect'}) => {
  const stepIndex = steps.findIndex((ele) => ele === step);

  return (
    <Row justifyContent={'flex-start'}>
      {steps.map((_step, index) => (
        <View
          style={{
            ...styles.indicator,
            backgroundColor:
              index <= stepIndex
                ? theme.COLORS.BTN_BG_BLUE
                : theme.COLORS.BTN_BG_DISABLE,
          }}
          key={index}
        />
      ))}
    </Row>
  );
};

const Heading = ({title = '', subTitle = ''}) => {
  return (
    <View style={{marginTop: 8}}>
      <Text style={styles.head}>{title}</Text>
      <Text style={styles.subHead}>{subTitle}</Text>
    </View>
  );
};

const WalletSelect = ({onComplete = () => {}}) => {
  const {t} = useTranslation();
  const [cwLoading, setCwLoading] = useState(false);
  const [wcLoading, setWcLoading] = useState(false);

  const createNewWallet = () => {
    setCwLoading(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const connectWallet = () => {
    setWcLoading(true);
  };

  return (
    <View style={styles.slideBlock}>
      <Ripple style={styles.btn} onPress={createNewWallet}>
        <Row justifyContent={'center'}>
          {cwLoading && (
            <ActivityIndicator
              color={theme.COLORS.WHITE}
              size="small"
              style={{marginRight: 10}}
            />
          )}
          <Text style={styles.btnText}>{t('onboarding.createNewWallet')}</Text>
        </Row>
      </Ripple>
      <Ripple
        containerStyle={{marginTop: 16}}
        style={styles.btn}
        onPress={() => {
          connectWallet();
        }}>
        <Row justifyContent={'center'}>
          {wcLoading && (
            <ActivityIndicator
              color={theme.COLORS.WHITE}
              size="small"
              style={{marginRight: 10}}
            />
          )}
          <Text style={styles.btnText}>{t('onboarding.wcconnect')}</Text>
        </Row>
      </Ripple>
    </View>
  );
};

const WelcomeScreen = ({
  userName = '',
  walletAddress = '',
  setUserName = () => {},
  onComplete = () => {},
}) => {
  const web3 = useSelector((state) => state.web3);
  const {t} = useTranslation();

  const [name, setName] = useState(userName);
  const [referralCode, setReferralCode] = useState('');
  const [inProgress, setInProgress] = useState(false)

  const nameInput = useRef(null);
  const referralInput = useRef(null);

  const gotoNextStep = async () => {
    setInProgress(true);
    const walletRet = await GetOrCreateLocalWallet();

    if (walletRet) {
      // check name
      const setNameRet = await setUserNameProc();
      if (setNameRet) {
        onComplete();
      }
    }
    setInProgress(false);
  };

  const setUserNameProc = async () => {
    if (name === '') {
      Alert.alert(t('onboarding.Error'), t('onboarding.UsernameEmpty'), [
        {text: t('onboarding.Ok'), type: 'cancel'},
      ]);
      return false;
    }
    if (userName && userName !== '' && userName === name) {
      return true;
    }

    data = await updateOrCreateUser(walletAddress, name, referralCode);
    if (data) {
      if (data.ok) {
        setUserName({userName: name});
        setTeam(data.team);
      } else {
        Alert.alert(
          t('onboarding.Error'),
          String(data.error),
          [{text: t('onboarding.Ok'), type: 'cancel'}],
        );
        return false;
      }
    } else {
      // Any other error
      Alert.alert(
        t('onboarding.Error'),
        t('onboarding.ErrWhileSettingUserName'),
        [{text: t('onboarding.Ok'), type: 'cancel'}],
      );
      return false;
    }
    return true;
  };

  const isInputCorrect = () => {
    return name === ''
  }

  useEffect(async () => {
    setInProgress(true);
    const referral = await retrieveReferral();
    await setReferral(referral);
    setReferralCode(referral);
    setInProgress(false);
  }, []);

  return (
    <View style={styles.slideBlock}>
      <View>
        <Text style={styles.placeholder}>{t('onboarding.avatarname')}</Text>
        <TextInput
          ref={nameInput}
          autoCorrect={false}
          spellCheck={false}
          style={styles.textInput}
          value={name}
          placeholder={t('onboarding.johnthecleaner123')}
          placeholderTextColor={theme.COLORS.BORDER}
          onChangeText={(text) => {
            setName(text);
          }}
          color={'white'}
          autoCapitalize="none"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => {
            referralInput.current.focus();
          }}
        />
      </View>

      <Row
        style={{
          marginTop: 16,
        }}>
        <Text style={styles.placeholder}>{t('onboarding.referral')}</Text>
        <Text style={styles.placeholderoptional}>
          {t('onboarding.optional')}
        </Text>
      </Row>

      <TextInput
        ref={referralInput}
        autoCorrect={false}
        spellCheck={false}
        style={styles.textInput}
        value={referralCode}
        placeholder={t('onboarding.referralsuggestion')}
        placeholderTextColor={theme.COLORS.BORDER}
        onChangeText={setReferralCode}
        onBlur={() => {
          setReferralCode(referralCode);
        }}
        color={'white'}
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => {
          Keyboard.dismiss();
        }}
      />
      <Pressable
        disabled={isInputCorrect() && !inProgress}
        style={isInputCorrect() ? styles.disabledBtn : styles.btn}
        onPress={() => {
          gotoNextStep();
        }}>
        <Text style={isInputCorrect() ? styles.disabledBtnText : styles.btnText}>
          {t('onboarding.next')}
        </Text>
      </Pressable>
      <InProgress isVisible={inProgress} />
    </View>
  );
};

const PrivacyScreen = ({onStartTutorial = () => {}, onComplete = () => {}}) => {
  const {t} = useTranslation();
  const [privacy, setPrivacy] = useState(0);
  const [agreeTOC, setAgreeTOC] = useState(true);
  const [inProgress, setInProgress] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  const switchPrivacy = (_privacy) => {
    setPrivacy(_privacy);
  };

  const switchAgreeTOC = (agree) => {
    setAgreeTOC(agree);
  };

  const doCompleteAction = async () => {
    const walletAddress = await getWalletAddress();
    await setPrivacySetting(privacy);
    await setPrivacyAndTermsAccepted(agreeTOC);
    await updatePrivacyAndTOC(
      walletAddress,
      privacy === 0 ? 'share_data_live' : 'not_share_data_live',
      agreeTOC ? 'ACCEPTED' : 'REJECTED',
    );
    onComplete();
  };

  const onPressStartCleanup = async () => {
    setInProgress(true);
    await doCompleteAction();
    setInProgress(false);
  };

  return (
    <View style={styles.slideBlock}>
      <View>
        <Ripple
          style={
            privacy === 0
              ? styles.radioContainerSelected
              : styles.radioContainer
          }
          onPress={() => switchPrivacy(0)}>
          <View style={styles.radioTextCol}>
            <Text style={styles.radioTitle}>
              {t('onboarding.mapreportswithavatar')}
            </Text>
            <Text style={styles.radioSubTitle}>
              {t('onboarding.traceable')}
            </Text>
          </View>
          <View style={privacy === 0 ? styles.radioSelected : styles.radio} />
        </Ripple>
        <Ripple
          style={
            privacy === 1
              ? styles.radioContainerSelected
              : styles.radioContainer
          }
          onPress={() => switchPrivacy(1)}>
          <View style={styles.radioTextCol}>
            <Text style={styles.radioTitle}>
              {t('onboarding.sharereportsanonymously')}
            </Text>
            <Text style={styles.radioSubTitle}>
              {t('onboarding.nodatacollectedwhileflagging')}
            </Text>
          </View>
          <View style={privacy === 1 ? styles.radioSelected : styles.radio} />
        </Ripple>
      </View>
      <View
        style={{
          marginTop: 36,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text style={styles.tocContainer}>
          {t('onboarding.tocPrefix')}
          <Text
            style={styles.tocLink}
            onPress={() => {
              setTermsVisible(true);
            }}>
            {t('onboarding.tocLink')}
          </Text>
        </Text>
        <Ripple
          onPress={() => {
            switchAgreeTOC(!agreeTOC);
          }}>
          {agreeTOC ? <CheckIcon /> : <UncheckIcon />}
        </Ripple>
      </View>

      <Pressable
        disabled={!agreeTOC && !inProgress}
        style={agreeTOC ? styles.btn : styles.disabledBtn}
        onPress={onPressStartCleanup}>
        <Text style={agreeTOC ? styles.btnText : styles.disabledBtnText }>
          {t('onboarding.startCleanup')}
        </Text>
      </Pressable>
      <TermsAndConditions isVisible={termsVisible} setIsVisible={setTermsVisible} />
      <InProgress isVisible={inProgress} />
    </View>
  );
};

export const Onboarding = (props) => {
  const web3 = useSelector((state) => state.web3);

  const {t} = useTranslation();
  const {navigation} = props;
  const connector = useWalletConnect();

  /**
   * 1. choose wallet - local or walletconnect
   * 2. if local, then, choose create or load
   * 3. if walletconnec, then, do walletconnect
   * 4. if already exist, then, load username, else new username
   * 5. end
   */
  const [step, setStep] = useState('name'); // name | privacy
  const [walletAddress, setWalletAddress] = useState(null);

  const scrollX = React.useRef(new Animated.Value(0)).current;
  const keyExtractor = React.useCallback((_, index) => index.toString(), []);
  let flatListRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const viewConfigRef = React.useRef({viewAreaCoveragePercentThreshold: 50});
  const onViewRef = React.useRef(({viewableItems}) => {
    setActiveIndex(viewableItems[0].index);
  });
  const [name, setName] = useState('');
  const [connected, setConnected] = useState(false);
  const [inProgress, setInProgress] = useState(false)

  const initData = async () => {
    setInProgress(true);
    const _address = await createLocalWallet();
    if (_address === null) {
      return;
    }

    setWalletAddress(_address);

    setInProgress(false);
  };

  useEffect(() => {
    initData();
  }, []);

  const onWalletConnect = () => {
    setStep('name');
  };

  const onCompleteName = () => {
    setStep('privacy');
  };

  const onCompletePrivacy = () => {
    setFirstRun(true);
    navigation.dispatch(StackActions.replace('Home'));
  };

  const connectWallet = useCallback(async () => {
    let result = await connector.connect();
    if (result) {
      // connection flag
      setConnected(true);
    }

    return result;
  }, [connector]);

  const wcLogin = async () => {
    // Login From Wallet
    const response = await LoginFromWalletConnect(
      connector,
      web3,
      '', // referralCode,
    );
    setConnected(false);
    // move to user name input
    const username = await getUserName();
    if (username && username.userName) {
      setName(username.userName);
    }
    setStep('name');
  };

  useEffect(() => {
    if (connected) {
      wcLogin();
    }
  }, [connected]);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : null}>
        <ImageBackground
          source={background}
          resizeMode={'cover'}
          style={styles.background}>
          <View style={styles.container}>
            <View style={styles.buttonBlock}>
              <IndicatorView step={step} />
              <Heading
                title={t('onboarding.welcometocleanapp')}
                subTitle={
                  step === 'privacy'
                    ? t('onboarding.configureprivacy')
                    : t('onboarding.letssetupyourprofile')
                }
              />
              {step === 'name' && (
                <WelcomeScreen
                  walletAddress={walletAddress}
                  userName={name}
                  setUserName={setUserName}
                  onComplete={onCompleteName}
                />
              )}
              {step === 'privacy' && (
                <PrivacyScreen onComplete={onCompletePrivacy} />
              )}
            </View>
          </View>
        </ImageBackground>
        <InProgress isVisible={inProgress} />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  slideBlock: {
    marginTop: 36,
  },
  cardContainer: {
    width: Dimensions.get('screen').width,

    paddingHorizontal: 24,
  },
  head: {
    fontFamily: fontFamilies.Default,
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 40,
    color: theme.COLORS.WHITE,
    textTransform: 'none',
  },
  subHead: {
    fontFamily: fontFamilies.Default,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    color: theme.COLORS.TEXT_GREY,
  },
  placeholder: {
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: theme.COLORS.TEXT_GREY,
  },
  placeholderoptional: {
    fontFamily: fontFamilies.Default,
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 16,
    color: theme.COLORS.TEXT_GREY,
  },
  content: {
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#E0E9F4',
    textAlign: 'center',
    opacity: 0.7,
  },
  imgBlock: {
    paddingHorizontal: 39,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: theme.APP_COLOR_2,
    width: '100%',
    height: Dimensions.get('screen').width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
  },
  buttonBlock: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: theme.COLORS.PANEL_BG,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  btn: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 30,
  },
  disabledBtn: {
    backgroundColor: theme.COLORS.BTN_BG_DISABLE,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 30,
  },
  btnText: {
    textAlign: 'center',
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: theme.COLORS.WHITE,
  },
  disabledBtnText: {
    textAlign: 'center',
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: theme.COLORS.WHITE_OPACITY_40P,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 16,
    borderColor: theme.COLORS.BORDER,
    fontFamily: fontFamilies.Default,
    marginTop: 6,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inProgressImage: {
    width: 60,
    height: 60,
  },
  indicator: {
    width: 10,
    height: 10,
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    borderRadius: 10,
    marginRight: 8,
  },
  radioContainer: {
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.COLORS.BORDER_UNSELECT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  radioContainerSelected: {
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.COLORS.BTN_BG_BLUE,
    backgroundColor: theme.COLORS.BTN_BG_BLUE_30P,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  radioTextCol: {},
  radioTitle: {
    fontFamily: fontFamilies.Default,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    color: theme.COLORS.WHITE,
  },
  radioSubTitle: {
    fontFamily: fontFamilies.DefaultItalic,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: theme.COLORS.WHITE,
  },
  radio: {
    width: 15,
    height: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.COLORS.BORDER_UNSELECT,
  },
  radioSelected: {
    width: 15,
    height: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.COLORS.BTN_BG_BLUE,
  },
  tocContainer: {
    color: theme.COLORS.WHITE,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: fontFamilies.Default,
  },
  tocLink: {
    color: theme.COLORS.BTN_BG_BLUE,
    textDecorationLine: 'underline',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: fontFamilies.Default,
  },
  btns: {
    marginTop: 30,
    alignItems: 'center',
  },
  background: {
    width: '100%',
    height: '100%',
  },
});
