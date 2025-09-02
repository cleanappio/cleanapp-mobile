import React, { useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, View, Text, TextInput, ToastAndroid, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '../utils/fontFamilies';
import { theme } from '../services/Common/theme';
import Ripple from '../components/Ripple';

import WalletSettingsIcon from '../assets/ico_cache_settings.svg';
import BottomSheetDialog from '../components/BotomSheetDialog';

import CopySmallIcon from '../assets/ico_copy_small.svg';
import EyeSmallIcon from '../assets/ico_eye_small.svg';
import EyeOffIcon from '../assets/ico_eye_off.svg';
import { BlurView } from '@react-native-community/blur';
import { Row } from '../components/Row';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import {
  getPrivacySetting,
  getUserName,
  getWalletAddress,
  getWalletData,
  setCacheVault,
  setPrivacySetting,
  setUserName,
} from '../services/DataManager';
import { useTranslation } from 'react-i18next';
import {
  getBlockchainLink,
  getRewardStats,
  updateOrCreateUser,
  updatePrivacyAndTOC,
} from '../services/API/APIManager';
import {generateReferralUrl} from '../functions/referral';
import {useStateValue} from '../services/State/State';
import {actions} from '../services/State/Reducer';
import ShareIcon from '../assets/ico_share.svg';

const CacheScreen = props => {
  const navigation = useNavigation();
  const [avatarOpened, setAvatarOpened] = useState(false);
  const [privacyOpened, setPrivacyOpened] = useState(false);
  const [cacheSettingOpened, setCacheSettingOpened] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletInfo, setWalletInfo] = useState(null);

  const [avatarName, setAvatarName] = useState('');
  const [shareDataStatus, setShareDataStatus] = useState(0);
  const [{ cacheVault }, dispatch] = useStateValue();
  const [blockchainLink, setBlockchainLink] = useState('');

  const { t } = useTranslation();

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

  const editAvatar = () => {
    setAvatarOpened(true);
  };

  const editPrivacy = () => {
    setPrivacyOpened(true);
  };

  const openWalletSettings = () => {
    setCacheSettingOpened(true);
  };

  const initWallet = async () => {
    const walletData = await getWalletData();
    setWalletInfo(walletData);
  };

  useFocusEffect(
    React.useCallback(() => {
      const internalFunc = async () => {
        await initWallet();
        getUserName().then((resp) => {
          if (resp) {
            setAvatarName(resp.userName);
          }
        });
        getPrivacySetting().then((resp) => {
          if (resp) {
            setShareDataStatus(resp);
          }
        });
        const wa = await getWalletAddress();
        setWalletAddress(await getWalletAddress(wa));
        getRewardStats(wa).then((resp) => {
          if (resp && resp.ok) {
            let cacheResult = {
              reports: resp.stats.kitns_daily + resp.stats.kitns_disbursed || 0,
              referrals: resp.stats.kitns_ref_daily + resp.stats.kitns_ref_disbursed || 0,
              dailyReports: resp.stats.kitns_daily || 0,
              dailyReferrals: resp.stats.kitns_ref_daily || 0,
              disbursedReports: resp.stats.kitns_disbursed || 0,
              disbursedReferrals: resp.stats.kitns_ref_disbursed || 0,
              disbursedTotal: resp.stats.kitns_disbursed + resp.stats.kitns_ref_disbursed || 0,
              dailyTotal: resp.stats.kitns_daily + resp.stats.kitns_ref_daily || 0,
              total: resp.stats.kitns_daily + resp.stats.kitns_ref_daily +
                resp.stats.kitns_disbursed + resp.stats.kitns_ref_disbursed || 0,
            };
            dispatch({
              type: actions.SET_CACHE_VAULT,
              cacheVault: cacheResult,
            });
            setCacheVault(cacheResult);
          }
        });
        getBlockchainLink(wa).then((resp) => {
          if (resp && resp.ok) {
            setBlockchainLink(resp.blockchainLink);
          }
        });
      }
      internalFunc();
    }, []),
  );

  const AvatarSheet = ({
    isVisible = false,
    onClose = () => { },
    onUpdateUser = async () => { },
  }) => {
    const [localAvatarName, setLocalAvatarName] = useState(avatarName === walletAddress ? '' : avatarName);
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.avatarHeader}>{t('cachescreen.editavatar')}</Text>
          <TextInput
            style={{ ...styles.textInput, marginTop: 20, marginBottom: 16 }}
            color={theme.COLORS.TEXT_GREY}
            autoCorrect={false}
            spellCheck={false}
            value={localAvatarName}
            placeholder={t('cachescreen.chooseavatar')}
            placeholderTextColor={theme.COLORS.TEXT_GREY_50P}
            autoFocus={true}
            onChangeText={setLocalAvatarName}
          />
          <Pressable
            style={{ ...styles.bigBtn, marginBottom: 16 }}
            onPress={async () => {
              const updateUserResult = await onUpdateUser(localAvatarName);
              if (updateUserResult) {
                setAvatarName(localAvatarName);
                onClose();
              }
            }}>
            <Text style={styles.txt16bold}>{t('cachescreen.submit')}</Text>
          </Pressable>
          <Pressable
            style={{ ...styles.bigBtnBlack, marginBottom: 16 }}
            onPress={() => {
              onClose();
            }}>
            <Text style={styles.txt16bold}>{t('cachescreen.cancel')}</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  const PrivacySheet = ({
    isVisible = false,
    dataSharingOption = 0,
    onClose = () => { },
  }) => {
    const [privacySelected, setPrivacySelected] = useState(dataSharingOption);

    const selectPrivacy = (privacy_index) => {
      setPrivacySelected(privacy_index);
    };

    const setPrivacy = async () => {
      await updatePrivacyAndTOC(
        walletAddress,
        privacySelected === 0 ? 'share_data_live' : 'not_share_data_live'
      );
      setPrivacySetting(privacySelected);
      setShareDataStatus(privacySelected);
      onClose();
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.avatarHeader}>{t('cachescreen.privacysettings')}</Text>
          {privacy_values.map((element, index) => (
            <View
              key={index}
              style={{
                ...(index === privacySelected
                  ? styles.blueCard
                  : styles.borderCard),
                marginTop: 16,
                width: '80%',
              }}>
              <Ripple onPress={() => selectPrivacy(index)}>
                <View style={{ ...styles.row, width: '100%' }}>
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
          <Pressable
            style={{ ...styles.bigBtn, marginTop: 16 }}
            onPress={setPrivacy}>
            <Text style={styles.txt16bold}>{t('cachescreen.Confirm')}</Text>
          </Pressable>
        </View>
      </Modal>
    );
  };

  const ReferralScreenModal = ({isVisible = false, onClose = () => {}}) => {
    const {t} = useTranslation();
    const [refUrl, setRefUrl] = useState('No refurl');

    const onShare = () => {
      let shareImage = {
        message: refUrl,
        subject: t('cachescreen.Sharingmyreferralcode'),
        title: t('cachescreen.Sharingmyreferralcode'),
      };
      Share.open(shareImage)
        .then(res => {})
        .catch(err => {});
    };

    React.useEffect(() => {
      if (isVisible) {
        generateReferralUrl().then(url => {
          if (url) {
            setRefUrl(url);
          }
        });
      }
    }, [isVisible]);

    return (
      <Modal animationType="slide" transparent={true} visible={isVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.referralModalContent}>
            <Text style={styles.avatarHeader}>{t('referral.title')}</Text>
            <Text style={styles.referralContent}>{t('referral.content')}</Text>

            <View style={styles.qrContainer}>
              <QRCode
                size={200}
                value={refUrl}
                color={theme.COLORS.BLACK}
                backgroundColor={theme.COLORS.WHITE}
                quietZone={5}
              />
            </View>

            <Text style={styles.referralUrl}>{refUrl}</Text>

            <View style={{...styles.row, gap: 16}}>
              <Pressable style={styles.smallBtn} onPress={onShare}>
                <Text style={styles.txt16bold}>{t('referral.share')}</Text>
              </Pressable>

              <Pressable style={{...styles.smallBtn, backgroundColor: theme.COLORS.BLACK_04}} onPress={onClose}>
                <Text style={styles.txt16bold}>{t('cachescreen.back')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const CacheSettingSheet = ({isVisible = false, onClose = () => {}}) => {
    const [isShowPrivateKey, setIsShowPrivateKey] = useState(true);
    const [isShowMnemonics, setIsShowMnemonics] = useState(true);

    const showMnemonics = () => {
      setIsShowMnemonics(!isShowMnemonics);
    };

    const showPrivateKey = () => {
      setIsShowPrivateKey(!isShowPrivateKey);
    };

    const onCopyWalletAddress = (address) => {
      Clipboard.setString(address);
      if (Platform.OS === 'ios') {
        Alert.alert('Copied to clipboard');
      } else {
        ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
      }
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
                <Text style={styles.txt12} >{walletAddress}</Text>
              </View>
              <Ripple onPress={() => onCopyWalletAddress(walletAddress)}>
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
              <View style={{ width: '70%' }}>
                <Text style={styles.txt12bold}>
                  {t('cachescreen.privatekey')}
                </Text>
                <View>
                  <Text style={{ ...styles.txt12, ...styles.txtBlur }}>
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
                <Text style={{ ...styles.txt9, color: theme.COLORS.BTN_BG_BLUE }}>
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
            style={{ ...styles.blue30Card, marginTop: 24, paddingHorizontal: 8 }}>
            <Text style={styles.txt12}>
              {t('cachescreen.keepyourkitnsafe')}
            </Text>
          </View>
          <View style={{ ...styles.blueBorderCard, marginTop: 24 }}>
            <View style={styles.row}>
              <View style={{ width: '70%' }}>
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
                <Text style={{ ...styles.txt9, color: theme.COLORS.BTN_BG_BLUE }}>
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
          <Ripple
            containerStyle={{ marginTop: 24 }}
            style={{...styles.bigBtnBlack, width: '100%'}}
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
        title={t('cachescreen.cachesettings')}
        headerIcon={<WalletSettingsIcon />}>

        <CacheSettingView />
      </BottomSheetDialog>
    );
  };

  const [referralOpened, setReferralOpened] = useState(false);

  const openReferralScreen = () => {
    setReferralOpened(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/** balance */}
          <View style={styles.balanceContainer}>
            <Row>
              <Text style={styles.txt16}>{t('cachescreen.total')}</Text>
              <Text style={{ ...styles.txt16, lineHeight: 16 }}>
                {cacheVault.total || 0} <Text style={styles.txt16}>{'KITN'}</Text>
              </Text>
            </Row>
            <Row>
              <Text style={styles.txt9}>{t('cachescreen.fromReports')}</Text>
              <Text style={styles.txt9}>
                {cacheVault.reports || 0} <Text style={styles.txt9}>{'KITN'}</Text>
              </Text>
            </Row>
            <Row>
              <Text style={styles.txt9}>{t('cachescreen.fromReferrals')}</Text>
              <Text style={styles.txt9}>
                {cacheVault.referrals || 0} <Text style={styles.txt9}>{'KITN'}</Text>
              </Text>
            </Row>
            <Row>
              <Text style={styles.txt9}>{t('cachescreen.todaysReports')}</Text>
              <Text style={styles.txt9}>
                {cacheVault.dailyReports} <Text style={styles.txt9}>{'KITN'}</Text>
              </Text>
            </Row>
            <Row>
              <Text style={styles.txt9}>{t('cachescreen.todaysReferrals')}</Text>
              <Text style={styles.txt9}>
                {cacheVault.dailyReferrals} <Text style={styles.txt9}>{'KITN'}</Text>
              </Text>
            </Row>
          </View>
          <View style={styles.balanceContainer}>
            <Row>
              <Text style={styles.txt12}>{t('cachescreen.todaysLitterbox')}</Text>
            </Row>
            <Text style={styles.txt24}>
              {`${cacheVault.dailyTotal || 0} `}
              <Text style={styles.txt16}>{'KITN'}</Text>
            </Text>
          </View>
          <View style={styles.balanceContainer}>
            <Row>
              <Text style={styles.txt12}>{t('cachescreen.blockchainLink')}</Text>
            </Row>
            <Row style={{ marginTop: 12 }}>
              <Text
                style={{ ...styles.txt12bold, color: theme.COLORS.GREEN_LINK }}
                onPress={() => Linking.openURL(blockchainLink)}
              >{blockchainLink}</Text>
            </Row>
          </View>
          {/** Avatar */}
          <View style={styles.row}>
            <Text style={styles.txt12}>{t('cachescreen.avatar')}</Text>
            <View style={styles.border} />
          </View>
          <View style={{ ...styles.blueCard, marginTop: 8 }}>
            <View style={styles.row}>
              <Text style={styles.txt12thin}>
                {avatarName === walletAddress ? t('cachescreen.avatarnotset') : avatarName}
              </Text>
              <Pressable style={styles.btnBlack} onPress={editAvatar}>
                <Text style={styles.txt16bold}>
                  {avatarName === walletAddress ? t('cachescreen.create') : t('cachescreen.edit')}
                </Text>
              </Pressable>
            </View>
          </View>
          {/** Privacy */}
          <View style={styles.block}>
            <View style={styles.row}>
              <Text style={styles.txt12}>{t('cachescreen.privacy')}</Text>
              <View style={styles.border} />
            </View>
            <View style={{ ...styles.blueCard, marginTop: 8 }}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.txt12thin}>
                    {shareDataStatus == 0
                      ? t('cachescreen.Mapreportswithavatar')
                      : t('cachescreen.Sharereportsanonymously')
                    }
                  </Text>
                  <Text style={styles.txt12thinitalic}>
                    {shareDataStatus == 0
                      ? t('cachescreen.Traceable')
                      : t('cachescreen.Nodatacollectedwhileflagging')
                    }
                  </Text>
                </View>
                <Pressable style={styles.btnBlack} onPress={editPrivacy}>
                  <Text style={styles.txt16bold}>{t('cachescreen.edit')}</Text>
                </Pressable>
              </View>
            </View>
            <View style={{ ...styles.greyCard, marginTop: 16 }}>
              <View style={styles.row}>
                <Text style={styles.txt16bold}>
                  {t('cachescreen.cachesettings')}
                </Text>
                <Pressable onPress={openWalletSettings}>
                  <WalletSettingsIcon />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={{...styles.greyCard, marginBottom: 16, marginTop: -20}}>
            <View style={styles.row}>
              <Text style={styles.txt16bold}>{t('referral.title')}</Text>
              <Pressable onPress={openReferralScreen}>
                <ShareIcon />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <AvatarSheet
        isVisible={avatarOpened}
        onClose={() => {
          setAvatarOpened(false);
        }}
        onUpdateUser={async (userName) => {
          if (userName.length == 0) {
            Alert.alert(
              t('onboarding.Error'),
              t('cachescreen.errAvatarEmpty'),
              [{ text: t('onboarding.Ok'), type: 'cancel' }],
            );
            return false;
          }
          const data = await updateOrCreateUser(walletAddress, userName);
          if (data && data.ok) {
            if (data.dup_avatar) {
              Alert.alert(
                t('onboarding.Error'),
                t('onboarding.ErrSameUsernameExists'),
                [{ text: t('onboarding.Ok'), type: 'cancel' }],
              );
              return false;
            }
            setUserName({ userName: userName });
            return true;
          } else {
            return false;
          }
        }}
      />
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
      <ReferralScreenModal
        isVisible={referralOpened}
        onClose={() => {
          setReferralOpened(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.COLORS.BG,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  block: {
    marginTop: 16,
    marginBottom: 36,
  },
  balanceContainer: {
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: theme.COLORS.PANEL_BG,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greyCard: {
    backgroundColor: theme.APP_COLOR_1,
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
    width: '80%',
    backgroundColor: theme.COLORS.BG,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  smallBtn: {
    width: '40%',
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  bigBtn: {
    width: '80%',
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
  textInput: {
    width: '80%',
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 16,
    borderColor: theme.COLORS.BORDER,
    fontFamily: fontFamilies.Default,
    marginTop: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  avatarHeader: {
    padding: 10,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  referralModalContent: {
    backgroundColor: theme.COLORS.BG,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: '90%',
    maxHeight: '80%',
  },
  referralContent: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fontFamilies.Default,
  },
  qrContainer: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  referralUrl: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fontFamilies.Default,
    paddingHorizontal: 16,
  },
});

export default CacheScreen;
