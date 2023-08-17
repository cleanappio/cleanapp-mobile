/* eslint-disable react-hooks/exhaustive-deps */
import {CommonActions, StackActions, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  Image,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  ImageBackground,
  Linking,
  Alert,
  Keyboard,
} from 'react-native';
import {ExpandingDot, LiquidLike} from 'react-native-animated-pagination-dots';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import Ripple from '../components/Ripple';
import {LoginFromWalletConnect, LoginProc} from '../functions/login';
import {
  changeUserName,
  requestUserName,
  saveUsageFlag,
  setDataSharingOption,
  startTutorial,
} from '../services/API/APIManager';
import {theme} from '../services/Common/theme';
import {
  getUserName,
  getWalletAddress,
  getWalletType,
  setFirstRun,
  setUserInfo,
  setUserName,
} from '../services/DataManager';
import {actions} from '../services/State/Reducer';
import {useStateValue} from '../services/State/State';
import {fontFamilies} from '../utils/fontFamilies';
import {useWalletConnect} from '@walletconnect/react-native-dapp';
import Swiper from 'react-native-swiper';
//import {theme} from '../services/Common/theme';
const background = require('../assets/onboard_background.jpg');

import CheckIcon from '../assets/btn_check.svg';
import UncheckIcon from '../assets/btn_uncheck.svg';
import {Row} from '../components/Row';
import {createLocalWallet, loginUser} from '../functions/walletconnect';

const bottomBlockHeight = 160;

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
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);

  const nameInput = useRef(null);
  const referralInput = useRef(null);

  const gotoNextStep = async () => {
    // check referral
    setNextBtnDisabled(true);
    const loginRet = await LoginProc(web3, referralCode);

    if (loginRet) {
      // check name
      const setNameRet = await setUserNameProc();
      if (setNameRet) {
        onComplete();
      }
    }
    setNextBtnDisabled(false);
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

    const data = await changeUserName(walletAddress, name);
    if (data && data.username) {
      if (data.username === 'user name already exists') {
        // same name exists
        Alert.alert(
          t('onboarding.Error'),
          t('onboarding.ErrSameUsernameExists'),
          [{text: t('onboarding.Ok'), type: 'cancel'}],
        );
        return false;
      } else {
        // success
        // set username to local storage
        setUserName({userName: data.username});
      }
    } else {
      // same name exists
      Alert.alert(
        t('onboarding.Error'),
        t('onboarding.ErrWhileSettingUserName'),
        [{text: t('onboarding.Ok'), type: 'cancel'}],
      );
      return false;
    }
    return true;
  };

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
          gotoNextStep();
        }}
      />
      <Ripple
        disabled={nextBtnDisabled}
        style={{...styles.btn, marginTop: 36}}
        onPress={() => {
          gotoNextStep();
        }}>
        <Text style={styles.btnText}>{t('onboarding.next')}</Text>
      </Ripple>
    </View>
  );
};

const PrivacyScreen = ({onStartTutorial = () => {}, onComplete = () => {}}) => {
  const {t} = useTranslation();
  const [privacy, setPrivacy] = useState(0);
  const [agreeTOC, setAgreeTOC] = useState(true);

  const switchPrivacy = (_privacy) => {
    setPrivacy(_privacy);
    setDataSharingOption(
      _privacy === 0 ? 'share_data_live' : 'not_share_data_live',
    );
  };

  const switchAgreeTOC = (agree) => {
    setAgreeTOC(agree);
  };

  const doCompleteAction = async () => {
    await setDataSharingOption(
      privacy === 0 ? 'share_data_live' : 'not_share_data_live',
    );
    await saveUsageFlag(agreeTOC ? {flag: 'ACCEPTED'} : {flag: 'REJECTED'});
    onComplete();
  };

  const onPressNext = () => {
    doCompleteAction();
  };

  const onPressStartTutorial = async () => {
    await startTutorial();
    await doCompleteAction();
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
              Linking.openURL('https://cleanapp.io');
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

      <View style={styles.btns}>
        <Ripple style={{...styles.skipbtn}} onPress={onPressNext}>
          <Text style={styles.btnText}>{t('onboarding.skip')}</Text>
        </Ripple>
        <Ripple
          containerStyle={{
            flex: 1,
            marginLeft: 16,
          }}
          style={{...styles.btn}}
          onPress={onPressStartTutorial}>
          <Text style={styles.btnText}>{t('onboarding.startTutorial')}</Text>
        </Ripple>
      </View>
    </View>
  );
};

export const Onboarding = (props) => {
  const web3 = useSelector((state) => state.web3);
  const [loading, setLoading] = useState(false);
  const [cwLoading, setCWLoading] = useState(false);
  const [wcLoading, setWCLoading] = useState(false);

  const {t} = useTranslation();
  const {navigation} = props;
  const [, dispatch] = useStateValue();
  const connector = useWalletConnect();

  /**
   * 1. choose wallet - local or walletconnect
   * 2. if local, then, choose create or load
   * 3. if walletconnec, then, do walletconnect
   * 4. if already exist, then, load username, else new username
   * 5. end
   */
  const [step, setStep] = useState('name'); // name | privacy
  const [stepIndex, setStepIndex] = useState(0);
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

  const initData = async () => {
    const _address = await createLocalWallet();
    if (_address === null) {
      return;
    }

    setWalletAddress(_address);

    const _username = await requestUserName(_address);
    if (_username === null) {
      return;
    }

    setUserName(_username);
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
            {step === 'walletSelect' && (
              <WalletSelect onComplete={onWalletConnect} />
            )}
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
    </KeyboardAvoidingView>
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
  btnContainer: {
    backgroundColor: 'yellow',
    width: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    marginVertical: 5,
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    paddingVertical: 14,
  },
  skipbtn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: theme.COLORS.BTN_BG_GREY,
    paddingVertical: 14,
    width: 82,
  },
  btnText: {
    textAlign: 'center',
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: 'white',
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 16,
    borderColor: theme.COLORS.BORDER,
    fontFamily: fontFamilies.Default,
    marginTop: 6,
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
    marginTop: 36,
    //justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  background: {
    width: '100%',
    height: '100%',
  },
});
