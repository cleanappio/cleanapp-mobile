import React, {useEffect, useRef, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  AccessibilityInfo,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  ToastAndroid,
  Alert,
  Platform,
  Share,
} from 'react-native';
import Reanimated, {
  cancelAnimation,
  Easing as ReanimatedEasing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';
import {fontFamilies} from '../utils/fontFamilies';
import {theme} from '../services/Common/theme';
import Ripple from '../components/Ripple';

import WalletSettingsIcon from '../assets/ico_cache_settings.svg';
import BottomSheetDialog from '../components/BotomSheetDialog';

import CopySmallIcon from '../assets/ico_copy_small.svg';
import EyeSmallIcon from '../assets/ico_eye_small.svg';
import EyeOffIcon from '../assets/ico_eye_off.svg';
import {BlurView} from '@react-native-community/blur';
import {Row} from '../components/Row';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import {
  getPrivacySetting,
  getUserName,
  getWalletAddress,
  getWalletData,
  setCacheVault,
  setPrivacySetting,
  setUserName,
} from '../services/DataManager';
import {useTranslation} from 'react-i18next';
import {
  getBlockchainLink,
  getRewardStats,
  updateOrCreateUser,
  updatePrivacyAndTOC,
} from '../services/API/APIManager';
import {generateReferralUrl} from '../functions/referral';
import {useStateValue} from '../services/State/State';
import {actions} from '../services/State/Reducer';
import AppVersionDisplay from '../components/AppVersionDisplay';

const CacheScreen = () => {
  const [avatarOpened, setAvatarOpened] = useState(false);
  const [privacyOpened, setPrivacyOpened] = useState(false);
  const [cacheSettingOpened, setCacheSettingOpened] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletInfo, setWalletInfo] = useState({
    privateKey: '',
    seedPhrase: '',
  });

  const [avatarName, setAvatarName] = useState('');
  const [shareDataStatus, setShareDataStatus] = useState(0);
  const [{cacheVault}, dispatch] = useStateValue();
  const [blockchainLink, setBlockchainLink] = useState('');
  const [refUrl, setRefUrl] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [referralGuideLayout, setReferralGuideLayout] = useState({
    section: null,
    explainer: null,
    invite: null,
    earn: null,
    grow: null,
    qr: null,
    share: null,
  });
  const shareInFlightRef = useRef(false);
  const referralGuideProgress = useSharedValue(0);
  const referralGuideGlow = useSharedValue(0);

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

  const editAvatar = () => {
    setAvatarOpened(true);
  };

  const editPrivacy = () => {
    setPrivacyOpened(true);
  };

  const openWalletSettings = () => {
    setCacheSettingOpened(true);
  };

  const showCopiedToClipboard = () => {
    if (Platform.OS === 'ios') {
      Alert.alert(t('cachescreen.copiedtoclipboard'));
    } else {
      ToastAndroid.show(t('cachescreen.copiedtoclipboard'), ToastAndroid.SHORT);
    }
  };

  const copyToClipboard = value => {
    if (!value) {
      return;
    }
    Clipboard.setString(value);
    showCopiedToClipboard();
  };

  const openExternalLink = async url => {
    if (!url) {
      return;
    }
    try {
      await Linking.openURL(url);
    } catch (err) {
      // Ignore invalid URLs so the screen remains stable.
    }
  };

  const updateReferralGuideLayout = (key, layout) => {
    setReferralGuideLayout(current => {
      const previous = current[key];
      if (
        previous &&
        previous.x === layout.x &&
        previous.y === layout.y &&
        previous.width === layout.width &&
        previous.height === layout.height
      ) {
        return current;
      }
      return {...current, [key]: layout};
    });
  };

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(enabled => {
        if (isMounted && typeof enabled === 'boolean') {
          setPrefersReducedMotion(enabled);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      cancelAnimation(referralGuideProgress);
      cancelAnimation(referralGuideGlow);
      referralGuideProgress.value = 0;
      referralGuideGlow.value = 0;
      return;
    }

    const uniqueTargetCount = 5;
    const loopDuration = 6200;
    referralGuideProgress.value = 0;
    referralGuideGlow.value = 0;
    referralGuideProgress.value = withRepeat(
      withTiming(uniqueTargetCount, {
        duration: loopDuration,
        easing: ReanimatedEasing.linear,
      }),
      -1,
      false,
    );
    referralGuideGlow.value = withRepeat(
      withTiming(1, {
        duration: loopDuration * 0.5,
        easing: ReanimatedEasing.inOut(ReanimatedEasing.quad),
      }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(referralGuideProgress);
      cancelAnimation(referralGuideGlow);
      referralGuideProgress.value = 0;
      referralGuideGlow.value = 0;
    };
  }, [prefersReducedMotion, referralGuideGlow, referralGuideProgress]);

  useFocusEffect(
    React.useCallback(() => {
      const internalFunc = async () => {
        const walletData = await getWalletData();
        setWalletInfo(
          walletData || {
            privateKey: '',
            seedPhrase: '',
          },
        );
        getUserName().then(resp => {
          if (resp) {
            setAvatarName(resp.userName);
          }
        });
        getPrivacySetting().then(resp => {
          if (resp) {
            setShareDataStatus(resp);
          }
        });
        const wa = await getWalletAddress();
        setWalletAddress(await getWalletAddress(wa));
        getRewardStats(wa).then(resp => {
          if (resp && resp.ok) {
            let cacheResult = {
              reports: resp.stats.kitns_daily + resp.stats.kitns_disbursed || 0,
              referrals:
                resp.stats.kitns_ref_daily + resp.stats.kitns_ref_disbursed ||
                0,
              dailyReports: resp.stats.kitns_daily || 0,
              dailyReferrals: resp.stats.kitns_ref_daily || 0,
              disbursedReports: resp.stats.kitns_disbursed || 0,
              disbursedReferrals: resp.stats.kitns_ref_disbursed || 0,
              disbursedTotal:
                resp.stats.kitns_disbursed + resp.stats.kitns_ref_disbursed ||
                0,
              dailyTotal:
                resp.stats.kitns_daily + resp.stats.kitns_ref_daily || 0,
              total:
                resp.stats.kitns_daily +
                  resp.stats.kitns_ref_daily +
                  resp.stats.kitns_disbursed +
                  resp.stats.kitns_ref_disbursed || 0,
            };
            dispatch({
              type: actions.SET_CACHE_VAULT,
              cacheVault: cacheResult,
            });
            setCacheVault(cacheResult);
          }
        });
        getBlockchainLink(wa).then(resp => {
          if (resp && resp.ok) {
            setBlockchainLink(resp.blockchainLink);
          }
        });
        generateReferralUrl().then(url => {
          if (url) {
            setRefUrl(url);
          }
        });
      };
      internalFunc();
    }, []),
  );

  const AvatarSheet = ({
    isVisible = false,
    onClose = () => {},
    onUpdateUser = async () => {},
  }) => {
    const [localAvatarName, setLocalAvatarName] = useState(
      avatarName === walletAddress ? '' : avatarName,
    );
    return (
      <Modal animationType="slide" transparent={true} visible={isVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.avatarHeader}>{t('cachescreen.editavatar')}</Text>
          <TextInput
            style={{...styles.textInput, marginTop: 20, marginBottom: 16}}
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
            style={{...styles.bigBtn, marginBottom: 16}}
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
            style={{...styles.bigBtnBlack, marginBottom: 16}}
            onPress={() => {
              onClose();
            }}>
            <Text style={styles.txt16bold}>{t('cachescreen.cancel')}</Text>
          </Pressable>
        </View>
      </Modal>
    );
  };

  const PrivacySheet = ({
    isVisible = false,
    dataSharingOption = 0,
    onClose = () => {},
  }) => {
    const [privacySelected, setPrivacySelected] = useState(dataSharingOption);

    const selectPrivacy = privacy_index => {
      setPrivacySelected(privacy_index);
    };

    const setPrivacy = async () => {
      await updatePrivacyAndTOC(
        walletAddress,
        privacySelected === 0 ? 'share_data_live' : 'not_share_data_live',
      );
      setPrivacySetting(privacySelected);
      setShareDataStatus(privacySelected);
      onClose();
    };

    return (
      <Modal animationType="slide" transparent={true} visible={isVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.avatarHeader}>
            {t('cachescreen.privacysettings')}
          </Text>
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
                <View style={{...styles.row, width: '100%'}}>
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
            style={{...styles.bigBtn, marginTop: 16}}
            onPress={setPrivacy}>
            <Text style={styles.txt16bold}>{t('cachescreen.Confirm')}</Text>
          </Pressable>
        </View>
      </Modal>
    );
  };

  const onShareReferral = async () => {
    if (shareInFlightRef.current || isSharing || !refUrl) {
      return;
    }
    shareInFlightRef.current = true;
    setIsSharing(true);
    let fallbackTimer;
    try {
      fallbackTimer = setTimeout(() => {
        shareInFlightRef.current = false;
        setIsSharing(false);
      }, 8000);
      await Share.share({
        message: refUrl,
        title: t('cachescreen.Sharingmyreferralcode'),
      });
    } catch (err) {
      // Swallow errors (including cancel) to avoid locking the UI.
    } finally {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
      shareInFlightRef.current = false;
      setIsSharing(false);
    }
  };

  const ReferralGuideOverlay = () => {
    const {section, explainer, invite, earn, qr, share} = referralGuideLayout;

    if (!section || !explainer || !invite || !earn || !qr || !share) {
      return null;
    }

    const toSectionRect = layout => ({
      x: explainer.x + layout.x,
      y: explainer.y + layout.y,
      width: layout.width,
      height: layout.height,
    });

    const guideTargets = [
      {
        key: 'invite',
        layout: toSectionRect(invite),
        insetX: 8,
        insetY: 8,
        radius: 18,
      },
      {
        key: 'share',
        layout: share,
        insetX: 8,
        insetY: 8,
        radius: 18,
      },
      {
        key: 'earn',
        layout: toSectionRect(earn),
        insetX: 8,
        insetY: 8,
        radius: 18,
      },
      {
        key: 'qr',
        layout: qr,
        insetX: 12,
        insetY: 12,
        radius: 24,
      },
      {
        key: 'section',
        layout: {
          x: 4,
          y: 4,
          width: section.width - 8,
          height: section.height - 8,
        },
        insetX: 0,
        insetY: 0,
        radius: 24,
      },
    ];

    const guideFrames = [
      guideTargets[guideTargets.length - 1],
      ...guideTargets,
      guideTargets[0],
    ];
    const inputRange = guideFrames.map((_, frameIndex) => frameIndex - 1);
    const guideCount = guideTargets.length;
    const leftRange = guideFrames.map(
      target => target.layout.x - target.insetX,
    );
    const topRange = guideFrames.map(target => target.layout.y - target.insetY);
    const widthRange = guideFrames.map(
      target => target.layout.width + target.insetX * 2,
    );
    const heightRange = guideFrames.map(
      target => target.layout.height + target.insetY * 2,
    );
    const radiusRange = guideFrames.map(target => target.radius);

    const wrapGuidePhase = phase => {
      'worklet';
      const wrappedPhase = phase % guideCount;
      return wrappedPhase < 0 ? wrappedPhase + guideCount : wrappedPhase;
    };

    const leadContourStyle = useAnimatedStyle(() => {
      const phase = wrapGuidePhase(referralGuideProgress.value);
      const glow = prefersReducedMotion ? 0 : referralGuideGlow.value;
      return {
        left: interpolate(phase, inputRange, leftRange, Extrapolation.CLAMP),
        top: interpolate(phase, inputRange, topRange, Extrapolation.CLAMP),
        width: interpolate(phase, inputRange, widthRange, Extrapolation.CLAMP),
        height: interpolate(
          phase,
          inputRange,
          heightRange,
          Extrapolation.CLAMP,
        ),
        borderRadius: interpolate(
          phase,
          inputRange,
          radiusRange,
          Extrapolation.CLAMP,
        ),
        opacity: prefersReducedMotion ? 0.2 : 0.14 + glow * 0.05,
        transform: [
          {
            scale: prefersReducedMotion
              ? 1
              : interpolate(glow, [0, 0.5, 1], [0.998, 1.01, 1]),
          },
        ],
      };
    });

    const trailPrimaryContourStyle = useAnimatedStyle(() => {
      const phase = wrapGuidePhase(referralGuideProgress.value - 0.16);
      const glow = prefersReducedMotion ? 0 : referralGuideGlow.value;
      return {
        left: interpolate(phase, inputRange, leftRange, Extrapolation.CLAMP),
        top: interpolate(phase, inputRange, topRange, Extrapolation.CLAMP),
        width: interpolate(phase, inputRange, widthRange, Extrapolation.CLAMP),
        height: interpolate(
          phase,
          inputRange,
          heightRange,
          Extrapolation.CLAMP,
        ),
        borderRadius: interpolate(
          phase,
          inputRange,
          radiusRange,
          Extrapolation.CLAMP,
        ),
        opacity: prefersReducedMotion ? 0.28 : 0.26 + glow * 0.08,
        transform: [
          {
            scale: prefersReducedMotion
              ? 1.012
              : interpolate(glow, [0, 0.5, 1], [1.01, 1.024, 1.012]),
          },
        ],
      };
    });

    const trailSecondaryContourStyle = useAnimatedStyle(() => {
      const phase = wrapGuidePhase(referralGuideProgress.value - 0.32);
      const glow = prefersReducedMotion ? 0 : referralGuideGlow.value;
      return {
        left: interpolate(phase, inputRange, leftRange, Extrapolation.CLAMP),
        top: interpolate(phase, inputRange, topRange, Extrapolation.CLAMP),
        width: interpolate(phase, inputRange, widthRange, Extrapolation.CLAMP),
        height: interpolate(
          phase,
          inputRange,
          heightRange,
          Extrapolation.CLAMP,
        ),
        borderRadius: interpolate(
          phase,
          inputRange,
          radiusRange,
          Extrapolation.CLAMP,
        ),
        opacity: prefersReducedMotion ? 0.34 : 0.34 + glow * 0.1,
        transform: [
          {
            scale: prefersReducedMotion
              ? 1.02
              : interpolate(glow, [0, 0.5, 1], [1.02, 1.04, 1.024]),
          },
        ],
      };
    });

    const contourLayers = [
      {
        key: 'trail-secondary',
        animatedStyle: trailSecondaryContourStyle,
      },
      {
        key: 'trail-primary',
        animatedStyle: trailPrimaryContourStyle,
      },
      {
        key: 'lead',
        animatedStyle: leadContourStyle,
      },
    ];

    return (
      <View pointerEvents="none" style={styles.referralGuideLayer}>
        {contourLayers.map(layer => {
          return (
            <Reanimated.View
              key={layer.key}
              style={[styles.referralGuideContour, layer.animatedStyle]}>
              <View
                style={[
                  styles.referralGuideContourSoft,
                  styles.referralGuideContourInset,
                ]}
              />
              <View
                style={[
                  styles.referralGuideContourMid,
                  styles.referralGuideContourInset,
                ]}
              />
              <View
                style={[
                  styles.referralGuideContourCore,
                  styles.referralGuideContourInset,
                ]}
              />
            </Reanimated.View>
          );
        })}
      </View>
    );
  };

  const ReferralShareSection = () => {
    return (
      <View
        style={styles.referralSection}
        onLayout={({nativeEvent}) =>
          updateReferralGuideLayout('section', nativeEvent.layout)
        }>
        <ReferralGuideOverlay />
        <Text style={styles.txt16bold}>{t('cachescreen.referCleanapp')}</Text>

        <View
          style={styles.referralExplainerRow}
          onLayout={({nativeEvent}) =>
            updateReferralGuideLayout('explainer', nativeEvent.layout)
          }>
          <View
            style={styles.referralExplainerCol}
            onLayout={({nativeEvent}) =>
              updateReferralGuideLayout('invite', nativeEvent.layout)
            }>
            <Text style={styles.referralExplainerLabel}>
              {'👤 '}
              {t('referral.explainerInviteTitle')}
            </Text>
            <Text style={styles.referralExplainerDesc}>
              {t('referral.explainerInviteDesc')}
            </Text>
          </View>
          <View style={styles.referralExplainerDivider} />
          <View
            style={styles.referralExplainerCol}
            onLayout={({nativeEvent}) =>
              updateReferralGuideLayout('earn', nativeEvent.layout)
            }>
            <Text style={styles.referralExplainerLabel}>
              {'🔁 '}
              {t('referral.explainerEarnTitle')}
            </Text>
            <Text style={styles.referralExplainerDesc}>
              {t('referral.explainerEarnDesc')}
            </Text>
          </View>
          <View style={styles.referralExplainerDivider} />
          <View
            style={styles.referralExplainerCol}
            onLayout={({nativeEvent}) =>
              updateReferralGuideLayout('grow', nativeEvent.layout)
            }>
            <Text style={styles.referralExplainerLabel}>
              {'🌱 '}
              {t('referral.explainerGrowTitle')}
            </Text>
            <Text style={styles.referralExplainerDesc}>
              {t('referral.explainerGrowDesc')}
            </Text>
          </View>
        </View>

        {refUrl ? (
          <View
            style={styles.qrContainer}
            onLayout={({nativeEvent}) =>
              updateReferralGuideLayout('qr', nativeEvent.layout)
            }>
            <QRCode
              size={180}
              value={refUrl}
              color={theme.COLORS.BLACK}
              backgroundColor={theme.COLORS.WHITE}
              quietZone={5}
            />
          </View>
        ) : null}

        <View style={styles.referralLinkBlock}>
          <View style={styles.referralLinkRow}>
            <Text
              style={styles.referralUrlLink}
              onPress={() => openExternalLink(refUrl)}
              numberOfLines={2}
              ellipsizeMode="tail">
              {refUrl}
            </Text>
            <Pressable
              onPress={() => copyToClipboard(refUrl)}
              hitSlop={12}
              disabled={!refUrl}>
              <CopySmallIcon />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[
            styles.referralShareButton,
            isSharing && styles.smallBtnDisabled,
          ]}
          onLayout={({nativeEvent}) =>
            updateReferralGuideLayout('share', nativeEvent.layout)
          }
          onPress={onShareReferral}
          disabled={isSharing || !refUrl}>
          <Text style={styles.txt16bold}>{t('referral.share')}</Text>
        </Pressable>
      </View>
    );
  };

  const CacheSettingSheet = ({isVisible = false, onClose = () => {}}) => {
    const [isShowPrivateKey, setIsShowPrivateKey] = useState(true);
    const [isShowMnemonics, setIsShowMnemonics] = useState(true);

    const showMnemonics = () => {
      setIsShowMnemonics(current => !current);
    };

    const showPrivateKey = () => {
      setIsShowPrivateKey(current => !current);
    };

    const onCopyWalletAddress = address => {
      copyToClipboard(address);
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
                      overlayColor="transparent"
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
              {t('cachescreen.keepyourkitnsafe')}
            </Text>
          </View>
          <View style={{...styles.blueBorderCard, marginTop: 24}}>
            <View style={styles.row}>
              <View style={{width: '70%'}}>
                <Text style={styles.txt12bold}>
                  {t('cachescreen.mnemonicphrase')}
                </Text>
                <View>
                  <Text style={{...styles.txt12, ...styles.txtBlur}}>
                    {walletInfo.seedPhrase}
                  </Text>
                  {isShowMnemonics && (
                    <BlurView
                      blurAmount={1}
                      blurRadius={1}
                      blurType="light"
                      overlayColor="transparent"
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
          <Ripple
            containerStyle={{marginTop: 24}}
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/** balance */}
          <View style={styles.balanceContainer}>
            <Row>
              <Text style={styles.txt16}>{t('cachescreen.total')}</Text>
              <Text style={{...styles.txt16, lineHeight: 16}}>
                {cacheVault.total || 0}{' '}
                <Text style={styles.txt16}>{'KITN'}</Text>
              </Text>
            </Row>
            <Row>
              <Text style={styles.txt9}>{t('cachescreen.fromReports')}</Text>
              <Text style={styles.txt9}>
                {cacheVault.reports || 0}{' '}
                <Text style={styles.txt9}>{'KITN'}</Text>
              </Text>
            </Row>
            <Row>
              <Text style={styles.txt9}>{t('cachescreen.fromReferrals')}</Text>
              <Text style={styles.txt9}>
                {cacheVault.referrals || 0}{' '}
                <Text style={styles.txt9}>{'KITN'}</Text>
              </Text>
            </Row>
            {/*
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
            */}
          </View>
          {/*
          <View style={styles.balanceContainer}>
            <Row>
              <Text style={styles.txt12}>{t('cachescreen.todaysLitterbox')}</Text>
            </Row>
            <Text style={styles.txt24}>
              {`${cacheVault.dailyTotal || 0} `}
              <Text style={styles.txt16}>{'KITN'}</Text>
            </Text>
          </View>
          */}
          <View style={styles.topActionRow}>
            <View style={[styles.greyCard, styles.topActionCard]}>
              <View style={styles.topActionCardContent}>
                <Text style={styles.topActionEmoji}>{'🔗'}</Text>
                <Text
                  style={styles.topActionLink}
                  onPress={() => openExternalLink(blockchainLink)}>
                  {t('cachescreen.blockchainLink')}
                </Text>
              </View>
            </View>
            <Pressable
              style={[styles.greyCard, styles.topActionCard]}
              onPress={openWalletSettings}>
              <View style={styles.topActionCardContent}>
                <WalletSettingsIcon />
                <Text style={styles.topActionTitle}>
                  {t('cachescreen.cachesettings')}
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.profileActionRow}>
            <Pressable
              style={[styles.blueCard, styles.profileActionCard]}
              onPress={editAvatar}>
              <Text style={styles.profileActionTileText}>
                {`${t('cachescreen.create')} ${t('cachescreen.avatar')}`}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.blueCard, styles.profileActionCard]}
              onPress={editPrivacy}>
              <Text style={styles.profileActionTileText}>
                {t('cachescreen.privacy')}
              </Text>
            </Pressable>
          </View>

          <ReferralShareSection />
        </View>
      </ScrollView>
      <View pointerEvents="none" style={styles.versionContainer}>
        <AppVersionDisplay
          showBuildNumber={false}
          style={styles.versionDisplay}
          textStyle={styles.versionText}
        />
      </View>
      <AvatarSheet
        isVisible={avatarOpened}
        onClose={() => {
          setAvatarOpened(false);
        }}
        onUpdateUser={async userName => {
          if (userName.length == 0) {
            Alert.alert(
              t('onboarding.Error'),
              t('cachescreen.errAvatarEmpty'),
              [{text: t('onboarding.Ok'), type: 'cancel'}],
            );
            return false;
          }
          const data = await updateOrCreateUser(walletAddress, userName);
          if (data && data.ok) {
            if (data.dup_avatar) {
              Alert.alert(
                t('onboarding.Error'),
                t('onboarding.ErrSameUsernameExists'),
                [{text: t('onboarding.Ok'), type: 'cancel'}],
              );
              return false;
            }
            setUserName({userName: userName});
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.COLORS.BG,
  },
  scrollContent: {
    paddingBottom: 128,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  block: {
    marginTop: 16,
    marginBottom: 20,
  },
  balanceContainer: {
    padding: 16,
    marginTop: 8,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  topActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  topActionCard: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActionEmoji: {
    fontSize: 20,
    lineHeight: 22,
    marginBottom: 4,
  },
  topActionLink: {
    fontFamily: fontFamilies.Default,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    color: theme.COLORS.GREEN_LINK,
    textAlign: 'center',
  },
  topActionCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActionTitle: {
    marginTop: 4,
    fontFamily: fontFamilies.Default,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    color: theme.COLORS.TEXT_GREY,
    textAlign: 'center',
  },
  profileActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  profileActionCard: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileActionTileText: {
    fontFamily: fontFamilies.Default,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    color: theme.COLORS.TEXT_GREY,
    textAlign: 'center',
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
  smallBtnDisabled: {
    opacity: 0.6,
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
  referralExplainerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  referralExplainerCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  referralExplainerLabel: {
    color: theme.COLORS.TEXT_GREY,
    fontSize: 13,
    fontFamily: fontFamilies.Default,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  referralExplainerDesc: {
    color: theme.COLORS.TEXT_GREY,
    fontSize: 10,
    lineHeight: 13,
    fontFamily: fontFamilies.Default,
    opacity: 0.8,
    textAlign: 'center',
  },
  referralExplainerDivider: {
    width: 1,
    backgroundColor: theme.COLORS.BORDER_GREY,
    marginVertical: 6,
  },
  referralSection: {
    marginTop: 0,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.COLORS.PANEL_BG,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  referralGuideLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  referralGuideContour: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  referralGuideContourInset: {
    ...StyleSheet.absoluteFillObject,
  },
  referralGuideContourSoft: {
    borderWidth: 9,
    borderColor: 'rgba(244, 255, 249, 0.1)',
  },
  referralGuideContourMid: {
    borderWidth: 4,
    borderColor: 'rgba(246, 255, 249, 0.28)',
  },
  referralGuideContourCore: {
    borderWidth: 1.5,
    borderColor: 'rgba(250, 255, 252, 0.82)',
  },
  qrContainer: {
    marginTop: 2,
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  referralLinkBlock: {
    width: '100%',
    alignItems: 'center',
  },
  referralLinkRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  referralUrlLink: {
    maxWidth: '82%',
    color: theme.COLORS.GREEN_LINK,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fontFamilies.Default,
    textAlign: 'center',
  },
  referralUrl: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fontFamilies.Default,
    paddingHorizontal: 16,
  },
  referralShareButton: {
    width: '100%',
    marginTop: 12,
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  versionContainer: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    alignItems: 'flex-end',
  },
  versionDisplay: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  versionText: {
    fontSize: 10,
    color: theme.COLORS.TEXT_GREY,
    opacity: 0.96,
    fontFamily: fontFamilies.Default,
    textAlign: 'right',
  },
});

export default CacheScreen;
