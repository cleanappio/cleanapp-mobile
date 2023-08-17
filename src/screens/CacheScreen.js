import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View, Text, Linking} from 'react-native';
import {fontFamilies} from '../utils/fontFamilies';
import {theme} from '../services/Common/theme';
import Ripple from '../components/Ripple';
import {Camera} from 'react-native-vision-camera';

import CameraIcon from '../assets/ico_btn_camera.svg';
import WalletSettingsIcon from '../assets/ico_cache_settings.svg';
import CopyIcon from '../assets/ico_copy.svg';
import ShareIcon from '../assets/ico_share.svg';
import BottomSheetDialog from '../components/BotomSheetDialog';

import CopySmallIcon from '../assets/ico_copy_small.svg';
import EyeSmallIcon from '../assets/ico_eye_small.svg';
import EyeOffIcon from '../assets/ico_eye_off.svg';
import MMIcon from '../assets/ico_metamask_outline.svg';

import MetamaskIcon from '../assets/ico_metamask.svg';
import TorusIcon from '../assets/ico_torus.svg';
import CoinbaseIcon from '../assets/ico_coinbase.svg';
import {BlurView} from '@react-native-community/blur';
import {Row} from '../components/Row';
import {useNavigation} from '@react-navigation/native';
import Share, {Social} from 'react-native-share';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-simple-toast';
import MetaMaskSDK from '@metamask/sdk';
import BackgroundTimer from 'react-native-background-timer';
import {ethers} from 'ethers';
import {
  getWalletAddress,
  getWalletData,
  setCacheVault,
} from '../services/DataManager';
import {useTranslation} from 'react-i18next';
import {
  getDataSharingOption,
  getReferralId,
  get_claim_time,
  get_reward_status,
  setDataSharingOption,
} from '../services/API/APIManager';
import {useStateValue} from '../services/State/State';
import {actions} from '../services/State/Reducer';

const CacheScreen = (props) => {
  const [privacyOpened, setPrivacyOpened] = useState(false);
  const [cacheSettingOpened, setCacheSettingOpened] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletInfo, setWalletInfo] = useState(null);
  const [referralId, setReferralId] = useState('');
  const [referralCode, setReferralCode] = useState(
    'cleanapp.io/referral#id:7239G?03$',
  );

  const [rewardStatusList, setRewardStatusList] = useState([]);
  const [shareDataStatus, setShareDataStatus] = useState('share_data_live');
  const [{cacheVault}, dispatch] = useStateValue();
  /* const [totalCache, setTotalCache] = useState({
    reports: 0,
    referrals: 0,
    offchainReports: 0,
    offchainReferrals: 0,
    onchainReports: 0,
    onchainReferrals: 0,
    onchainTotal: 0,
    offchainTotal: 0,
    total: 0,
  }); */

  const [nextRunTime, setNextRunTime] = useState(0);
  const navigation = useNavigation();
  const {t} = useTranslation();

  const privacy_values = [
    {
      value: t('cachescreen.Mapreportswithavatar'),
      sub_value: t('cachescreen.Traceable'),
    },
    {
      value: t('cachescreen.Sharereportsanonymously'),
      sub_value: t('cachescreen.Nodatacollectedwhileflagging'),
    },
  ];

  const MMSDK = new MetaMaskSDK({
    openDeeplink: (link) => {
      Linking.openURL(link); // Use React Native Linking method or another way of opening deeplinks.
    },
    timer: BackgroundTimer, // To keep the dapp alive once it goes to background.
    dappMetadata: {
      name: 'Cleanapp', // The name of your dapp.
      url: 'https://cleanapp.io', // The URL of your website.
    },
  });
  const ethereum = MMSDK.getProvider();

  const openCamera = () => {
    navigation.navigate('Camera');
  };

  const editPrivacy = () => {
    setPrivacyOpened(true);
  };

  const openWalletSettings = () => {
    setCacheSettingOpened(true);
  };

  const onShare = () => {
    let shareImage = {
      message: referralCode,
      subject: t('cachescreen.Sharingmyreferralcode'), //string
      title: t('cachescreen.Sharingmyreferralcode'), //string
    };
    Share.open(shareImage)
      .then((res) => {})
      .catch((err) => {});
  };

  const onCopy = () => {
    Clipboard.setString(referralCode);
    Toast.show(t('cachescreen.copiedtoclipboard'), Toast.SHORT);
  };

  const initWallet = async () => {
    const walletData = await getWalletData();
    setWalletAddress(walletData.publicKey);
    setWalletInfo(walletData);
  };

  useEffect(() => {
    initWallet();
    getReferralId().then((resp) => {
      if (resp && resp.result) {
        setReferralCode(`cleanapp.io/referral#id:${resp.result.referral_id}`);
      }
    });

    getDataSharingOption().then((resp) => {
      if (resp) {
        setShareDataStatus(
          resp.data_sharing_option === 'share_data_live' ? 0 : 1,
        );
      }
    });

    get_claim_time().then((resp) => {
      if (resp && resp.result) {
        setNextRunTime(resp.result);
      }
    });

    get_reward_status().then((resp) => {
      if (resp && resp.result) {
        setRewardStatusList(resp);
        let cacheResult = {
          reports: 0,
          referrals: 0,
          offchainReports: 0,
          offchainReferrals: 0,
          onchainReports: 0,
          onchainReferrals: 0,
          onchainTotal: 0,
          offchainTotal: 0,
          total: 0,
        };
        resp.result.forEach((element) => {
          cacheResult.total += element.reward;
          if (element.type === 'referral') {
            if (element.reward_status === 'paid') {
              cacheResult.onchainReferrals += element.reward;
            } else {
              cacheResult.offchainReferrals += element.reward;
            }
            cacheResult.referrals += element.reward;
          } else {
            if (element.reward_status === 'paid') {
              cacheResult.onchainReports += element.reward;
            } else {
              cacheResult.offchainReports += element.reward;
            }
            cacheResult.reports += element.reward;
          }
        });
        dispatch({
          type: actions.SET_CACHE_VAULT,
          cacheVault: cacheResult,
        });
        setCacheVault(cacheResult);
        //setTotalCache(cacheResult);
      }
    });
  }, []);

  const PrivacySheet = ({
    isVisible = false,
    dataSharingOption = 0,
    onClose = () => {},
  }) => {
    const [privacySelected, setPrivacySelected] = useState(dataSharingOption);

    const selectPrivacy = (privacy_index) => {
      setPrivacySelected(privacy_index);
    };

    const setPrivacy = async () => {
      await setDataSharingOption(
        privacySelected === 0 ? 'not_share_data_live' : 'share_data_live',
      );
      setShareDataStatus(privacySelected);
      onClose();
    };

    return (
      <BottomSheetDialog
        isVisible={isVisible}
        onClose={onClose}
        title={t('cachescreen.Editprivacyselection')}>
        {privacy_values.map((element, index) => (
          <View
            key={index}
            style={{
              ...(index === privacySelected
                ? styles.blueCard
                : styles.borderCard),
              marginTop: 16,
            }}>
            <Ripple onPress={() => selectPrivacy(index)}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.txt16}>{element.value}</Text>
                  <Text style={styles.txt12italic}>{element.sub_value}</Text>
                </View>
                <View
                  style={
                    index === privacySelected
                      ? styles.checked
                      : styles.unchecked
                  }
                />
              </View>
            </Ripple>
          </View>
        ))}
        <Ripple
          containerStyle={{marginTop: 24}}
          onPress={setPrivacy}
          style={styles.bigBtn}>
          <Text style={styles.txt16bold}>{t('cachescreen.Confirm')}</Text>
        </Ripple>
      </BottomSheetDialog>
    );
  };

  const CacheSettingSheet = ({isVisible = false, onClose = () => {}}) => {
    const [cacheSettingStep, setCacheSettingStep] = useState('main'); // main | connectMM
    const [metamaskStatus, setMetamaskStatus] = useState(''); // '' | connecting | connected
    const [metamaskLabel, setMetamaskLabel] = useState('Metamask');
    const [isShowPrivateKey, setIsShowPrivateKey] = useState(true);
    const [isShowMnemonics, setIsShowMnemonics] = useState(true);

    const connectMetamask = async () => {
      setMetamaskStatus('connecting');
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      //const provider = new ethers.providers.Web3Provider(ethereum);
      if (accounts) {
        setWalletAddress(accounts[0]);
        setMetamaskStatus('connected');
      }
      /* setMetamaskStatus('connecting');
      setTimeout(() => {
        setMetamaskStatus('connected');
      }, 10000); */
    };

    const switchStep = (step) => {
      setCacheSettingStep(step);
    };

    const showMnemonics = () => {
      setIsShowMnemonics(!isShowMnemonics);
    };

    const showPrivateKey = () => {
      setIsShowPrivateKey(!isShowPrivateKey);
    };

    const ConnectMMView = () => {
      return (
        <>
          <Ripple
            onPress={connectMetamask}
            style={{
              ...styles.blackCard,
              marginTop: 24,
              opacity: 0.5,
              paddingHorizontal: 8,
              borderColor: theme.COLORS.ORANGE,
              borderWidth: metamaskStatus === 'connecting' ? 1 : 0,
              backgroundColor:
                metamaskStatus === 'connected'
                  ? theme.COLORS.ORANGE
                  : theme.COLORS.BG,
            }}>
            <View style={styles.rowcenter}>
              <Text style={styles.txt16}>
                {metamaskStatus === 'connecting'
                  ? t('cachescreen.connecting')
                  : metamaskStatus === 'connected'
                  ? t('cachescreen.connected')
                  : t('cachescreen.metamask')}
              </Text>
              <MetamaskIcon />
            </View>
          </Ripple>
          <Ripple
            style={{
              ...styles.blackCard,
              marginTop: 24,
              opacity: 0.5,
              paddingHorizontal: 8,
            }}>
            <View style={styles.rowcenter}>
              <Text style={styles.txt16}>{t('cachescreen.coinbase')}</Text>
              <CoinbaseIcon />
            </View>
          </Ripple>
          <Ripple
            style={{
              ...styles.blackCard,
              marginTop: 24,
              opacity: 0.5,
              paddingHorizontal: 8,
            }}>
            <View style={styles.rowcenter}>
              <Text style={styles.txt16}>{t('cachescreen.torus')}</Text>
              <TorusIcon />
            </View>
          </Ripple>
          <Ripple
            containerStyle={{marginTop: 24}}
            style={styles.bigBtnBlack}
            onPress={() => {
              switchStep('main');
            }}>
            <Text style={styles.txt16bold}>{t('cachescreen.back')}</Text>
          </Ripple>
        </>
      );
    };

    const CacheSettingView = () => {
      return (
        <>
          {/** Your address */}
          <View
            style={{
              ...styles.blueBorderCard,
              marginTop: 24,
              paddingHorizontal: 8,
            }}>
            <View style={styles.row}>
              <View>
                <Text style={styles.txt12bold}>
                  {t('cachescreen.youraddress')}
                </Text>
                <Text style={styles.txt12}>{walletAddress}</Text>
              </View>
              <Ripple>
                <CopySmallIcon />
              </Ripple>
            </View>
          </View>
          <View
            style={{
              ...styles.blueBorderCard,
              marginTop: 24,
              paddingHorizontal: 8,
            }}>
            <View style={styles.row}>
              <View style={{width: '70%'}}>
                <Text style={styles.txt12bold}>
                  {t('cachescreen.privatekey')}
                </Text>
                <View>
                  <Text style={{...styles.txt12, ...styles.txtBlur}}>
                    {walletInfo.privateKey}
                  </Text>
                  {isShowPrivateKey && (
                    <BlurView
                      blurAmount={1}
                      blurRadius={1}
                      blurType="light"
                      overlayColor={'transparent'}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  )}
                </View>
              </View>
              <View style={styles.row}>
                <Text style={{...styles.txt9, color: theme.COLORS.BTN_BG_BLUE}}>
                  {isShowPrivateKey
                    ? t('cachescreen.taptoreveal')
                    : t('cachescreen.taptohide')}
                </Text>
                <Ripple onPress={showPrivateKey}>
                  {isShowPrivateKey ? <EyeSmallIcon /> : <EyeOffIcon />}
                </Ripple>
              </View>
            </View>
          </View>
          <View
            style={{...styles.blue30Card, marginTop: 24, paddingHorizontal: 8}}>
            <Text style={styles.txt12}>
              {t('cachescreen.keepyourcatssafe')}
            </Text>
          </View>
          <View style={{...styles.blueBorderCard, marginTop: 24}}>
            <View style={styles.row}>
              <View style={{width: '70%'}}>
                <Text style={styles.txt12bold}>
                  {t('cachescreen.mnemonicphrase')}
                </Text>
                <View>
                  <Text
                    style={{
                      ...styles.txt12,
                      ...styles.txtBlur,
                    }}>
                    {walletInfo.seedPhrase}
                  </Text>
                  {isShowMnemonics && (
                    <BlurView
                      blurAmount={1}
                      blurRadius={1}
                      blurType="light"
                      overlayColor={'transparent'}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  )}
                </View>
              </View>
              <View style={styles.row}>
                <Text style={{...styles.txt9, color: theme.COLORS.BTN_BG_BLUE}}>
                  {isShowMnemonics
                    ? t('cachescreen.taptoreveal')
                    : t('cachescreen.taptohide')}
                </Text>
                <Ripple onPress={showMnemonics}>
                  {isShowMnemonics ? <EyeSmallIcon /> : <EyeOffIcon />}
                </Ripple>
              </View>
            </View>
          </View>
          <View
            style={{
              ...styles.blackCard,
              marginTop: 24,
              opacity: 0.5,
              paddingHorizontal: 8,
            }}>
            <View style={styles.row}>
              <Text style={styles.txt16}>
                {t('cachescreen.connectMM')}
                <Text style={styles.txt12italic}>
                  {t('cachescreen.comingsoon')}
                </Text>
              </Text>
              <Ripple
                onPress={() => {
                  switchStep('connectMM');
                }}>
                <MMIcon />
              </Ripple>
            </View>
          </View>
          <Ripple
            containerStyle={{marginTop: 24}}
            style={styles.bigBtnBlack}
            onPress={onClose}>
            <Text style={styles.txt16bold}>{t('cachescreen.back')}</Text>
          </Ripple>
        </>
      );
    };

    return (
      <BottomSheetDialog
        isVisible={isVisible}
        onClose={onClose}
        title={
          cacheSettingStep === 'connectMM'
            ? t('cachescreen.connectMM')
            : t('cachescreen.cachesettings')
        }
        headerIcon={
          cacheSettingStep === 'connectMM' ? <MMIcon /> : <WalletSettingsIcon />
        }>
        {cacheSettingStep === 'connectMM' && <ConnectMMView />}
        {cacheSettingStep === 'main' && <CacheSettingView />}
      </BottomSheetDialog>
    );
  };

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.txt12}>{t('cachescreen.mycache')}</Text>
          {/** balance */}
          <View style={styles.balanceContainer}>
            <Row>
              <Text style={{...styles.txt16, lineHeight: 16}}>
                {cacheVault.total || 0} <Text style={styles.txt9}>{'$CATS'}</Text>
              </Text>
              <Text style={styles.txt12}>{'Lifetime XP'}</Text>
            </Row>
            <Row>
              <Text style={styles.txt9}>
                {cacheVault.reports || 0} <Text style={styles.txt9}>{'$CATS'}</Text>
              </Text>
              <Text style={styles.txt9}>{'Reports'}</Text>
            </Row>
            <Row>
              <Text style={styles.txt9}>
                {cacheVault.referrals || 0} <Text style={styles.txt9}>{'$CATS'}</Text>
              </Text>
              <Text style={styles.txt9}>{'Referrals'}</Text>
            </Row>
            {/* <Row>
              <Text style={styles.txt9}>
                {totalCache.offchainReports} <Text style={styles.txt9}>{'$CATS'}</Text>
              </Text>
              <Text style={styles.txt9}>{'Litterbox(offchain) reports'}</Text>
            </Row>
            <Row>
              <Text style={styles.txt9}>
                {totalCache.offchainReferrals} <Text style={styles.txt9}>{'$CATS'}</Text>
              </Text>
              <Text style={styles.txt9}>{'Litterbox(offchain) referrals'}</Text>
            </Row> */}
          </View>
          <View style={styles.balanceContainer}>
            <Row>
              <Text style={styles.txt12}>{'Litterbox(onchain)'}</Text>
              {/*  <Text style={styles.txt12}>{`Emptied in ${Math.ceil(nextRunTime / 3600)}h ${
                Math.ceil((nextRunTime % 3600) / 60)
              }mins`}</Text> */}
            </Row>
            <Text style={styles.txt24}>
              {`${cacheVault.offchainTotal || 0} `}
              <Text style={styles.txt16}>{'$CATS'}</Text>
            </Text>
          </View>
          <View style={styles.block}>
            <View style={{...styles.blueCard, marginTop: 8}}>
              <View style={styles.row}>
                <Text style={styles.txt16bold}>
                  {t('cachescreen.earnmorecats')}
                </Text>
                <Ripple onPress={openCamera}>
                  <CameraIcon />
                </Ripple>
              </View>
            </View>
          </View>
          {/** Privacy */}
          <View style={styles.block}>
            <View style={styles.row}>
              <Text style={styles.txt12}>{t('cachescreen.privacy')}</Text>
              <View style={styles.border} />
            </View>
            <View style={{...styles.blueCard, marginTop: 8}}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.txt12thin}>
                    {shareDataStatus == 0
                      ? t('cachescreen.sharemydatawithlapseoftime')
                      : t('cachescreen.Sharereportsanonymously')}
                  </Text>
                  <Text style={styles.txt12thinitalic}>
                    {shareDataStatus == 0
                      ? t('cachescreen.unitraceable')
                      : t('cachescreen.Nodatacollectedwhileflagging')}
                  </Text>
                </View>
                <Ripple style={styles.btnBlack} onPress={editPrivacy}>
                  <Text style={styles.txt16bold}>{t('cachescreen.edit')}</Text>
                </Ripple>
              </View>
            </View>
            <View style={{...styles.greyCard, marginTop: 8}}>
              <View style={styles.row}>
                <Text style={styles.txt16bold}>
                  {t('cachescreen.cachesettings')}
                </Text>
                <Ripple onPress={openWalletSettings}>
                  <WalletSettingsIcon />
                </Ripple>
              </View>
            </View>
          </View>
          {/** referral */}
          <View style={styles.block}>
            <View style={styles.row}>
              <Text style={styles.txt12}>
                {t('cachescreen.earn10catsperreferral')}
              </Text>
              <View style={styles.border} />
            </View>
            <View style={{...styles.blankCard, marginTop: 8}}>
              <View style={styles.row}>
                <Text style={styles.txt12italic}>{referralCode}</Text>
                <Ripple style={styles.btnBlack} onPress={onShare}>
                  <ShareIcon />
                </Ripple>
                <Ripple style={styles.btnBlack} onPress={onCopy}>
                  <CopyIcon />
                </Ripple>
              </View>
            </View>
          </View>
          {/** Coming Soon */}
          <View style={styles.block}>
            <View style={styles.row}>
              <Text style={styles.txt12}>{t('cachescreen.comingsoon2')}</Text>
              <View style={styles.border} />
            </View>
            <View style={{...styles.blueCard, marginTop: 8}}>
              <View style={styles.row}>
                <Text style={styles.txt16bold}>{t('cachescreen.swap')}</Text>
                <Text style={styles.txt9}>
                  {t('cachescreen.swapyourcatsintodogsor')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <PrivacySheet
        isVisible={privacyOpened}
        dataSharingOption={shareDataStatus}
        onClose={() => {
          setPrivacyOpened(false);
        }}
      />
      <CacheSettingSheet
        isVisible={cacheSettingOpened}
        onClose={() => {
          setCacheSettingOpened(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  block: {
    marginTop: 16,
    marginBottom: 36,
  },
  balanceBlock: {
    marginTop: 16,
  },
  balanceContainer: {
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: theme.COLORS.PANEL_BG,
  },
  blockHeader: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowcenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greyCard: {
    backgroundColor: theme.APP_COLOR_1,
    borderRadius: 8,
    padding: 16,
  },
  blackCard: {
    backgroundColor: theme.COLORS.BG,
    borderRadius: 8,
    padding: 16,
  },
  blueCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.COLORS.BTN_BG_BLUE_30P,
    borderWidth: 1,
    borderColor: theme.COLORS.BTN_BG_BLUE,
    borderRadius: 8,
  },
  blue30Card: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.COLORS.BTN_BG_BLUE_30P,
    borderRadius: 8,
  },
  blueBorderCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.BTN_BG_BLUE,
    borderRadius: 8,
  },
  blankCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  borderCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.BORDER_UNSELECT,
    borderRadius: 8,
  },
  border: {
    marginLeft: 16,
    height: 1,
    flex: 1,
    backgroundColor: theme.COLORS.BORDER_GREY,
  },

  btnBlack: {
    backgroundColor: theme.APP_COLOR_1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bigBtnBlack: {
    width: '100%',
    backgroundColor: theme.COLORS.BG,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  bigBtn: {
    width: '100%',
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  checked: {
    borderRadius: 15,
    width: 15,
    height: 15,
    borderWidth: 2,
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    borderColor: theme.COLORS.BTN_BG_BLUE,
  },
  unchecked: {
    borderRadius: 15,
    width: 15,
    height: 15,
    borderWidth: 2,
    borderColor: theme.COLORS.BORDER_UNSELECT,
  },
  txt9: {
    fontFamily: fontFamilies.Default,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  txt12: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  txt12bold: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
    color: theme.COLORS.TEXT_GREY,
  },
  txt12italic: {
    fontFamily: fontFamilies.DefaultItalic,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  txt12thin: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '300',
    color: theme.COLORS.TEXT_GREY,
  },
  txt12thinitalic: {
    fontFamily: fontFamilies.DefaultItalic,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '300',
    color: theme.COLORS.TEXT_GREY,
  },
  txt16: {
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  txt16bold: {
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: theme.COLORS.TEXT_GREY,
  },
  txt18: {
    fontFamily: fontFamilies.Default,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    color: theme.COLORS.TEXT_GREY,

  },
  txt24: {
    fontFamily: fontFamilies.Default,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  txtBlur: {
    textShadowColor: 'rgba(255,255,255,1)',
    textShadowOffset: {
      width: 10,
      height: 10,
    },
    textShadowRadius: 20,
  },
});

export default CacheScreen;
