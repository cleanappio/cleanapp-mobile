import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import {fontFamilies} from '../utils/fontFamilies';
import {theme} from '../services/Common/theme';
import {getUrls} from '../services/API/Settings';
import {getNextSortReport, submitSortReport} from '../services/API/APIManager';
import {getWalletAddress, setCacheVault} from '../services/DataManager';
import {ToastService} from '../components/ToastifyToast';
import {useStateValue} from '../services/State/State';
import {actions} from '../services/State/Reducer';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const SWIPE_THRESHOLD = 110;
const HOLD_CANCEL_DISTANCE = 18;
const HOLD_DURATION_MS = 3000;

type SortVerdict = 'high_value' | 'spam';

interface SortMetrics {
  report_seq: number;
  sort_count: number;
  high_value_count: number;
  spam_count: number;
  urgency_sum: number;
  urgency_mean: number;
}

interface SortCandidate {
  report: {
    seq: number;
    public_id: string;
    timestamp: string;
  };
  sort_metrics: SortMetrics;
}

const buildRawImageUrl = (seq?: number) => {
  if (!seq) {
    return '';
  }
  const urls = getUrls();
  if (!urls?.liveUrl) {
    return '';
  }
  return `${urls.liveUrl}/api/v3/reports/rawimage?seq=${seq}`;
};

const clampUrgency = (value: number) => Math.max(0, Math.min(10, value));

const formatUrgencyMean = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0.0';
  }
  return value.toFixed(1);
};

const SortScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const [{cacheVault}, dispatch] = useStateValue();

  const [sorterId, setSorterId] = useState('');
  const [candidate, setCandidate] = useState<SortCandidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [urgencyScore, setUrgencyScore] = useState(0);
  const [sessionSortCount, setSessionSortCount] = useState(0);
  const [sessionKitns, setSessionKitns] = useState(0);
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const holdProgress = useRef(new Animated.Value(0)).current;
  const holdValueRef = useRef(0);
  const isGestureCancelledRef = useRef(false);

  const rotation = useMemo(
    () =>
      translateX.interpolate({
        inputRange: [-screenWidth * 0.6, 0, screenWidth * 0.6],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp',
      }),
    [translateX],
  );

  const thermometerFillHeight = useMemo(
    () =>
      holdProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 224],
        extrapolate: 'clamp',
      }),
    [holdProgress],
  );

  useEffect(() => {
    const listenerId = holdProgress.addListener(({value}) => {
      holdValueRef.current = value;
      setUrgencyScore(clampUrgency(Math.round(value * 10)));
    });

    return () => {
      holdProgress.removeListener(listenerId);
    };
  }, [holdProgress]);

  const resetGestureState = useCallback(() => {
    holdProgress.stopAnimation();
    holdProgress.setValue(0);
    holdValueRef.current = 0;
    setUrgencyScore(0);
    isGestureCancelledRef.current = false;
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
        tension: 90,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, holdProgress, translateX]);

  const startHoldAnimation = useCallback(() => {
    holdProgress.setValue(0);
    holdValueRef.current = 0;
    setUrgencyScore(0);
    Animated.timing(holdProgress, {
      toValue: 1,
      duration: HOLD_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [holdProgress]);

  const incrementLocalKitns = useCallback(
    async (rewardKitns: number) => {
      if (!rewardKitns) {
        return;
      }

      const nextCacheVault = {
        ...cacheVault,
        reports: (cacheVault?.reports || 0) + rewardKitns,
        dailyReports: (cacheVault?.dailyReports || 0) + rewardKitns,
        dailyTotal: (cacheVault?.dailyTotal || 0) + rewardKitns,
        total: (cacheVault?.total || 0) + rewardKitns,
        offchainReports: (cacheVault?.offchainReports || 0) + rewardKitns,
        offchainTotal: (cacheVault?.offchainTotal || 0) + rewardKitns,
      };

      dispatch({
        type: actions.SET_CACHE_VAULT,
        cacheVault: nextCacheVault,
      });
      await setCacheVault(nextCacheVault);
    },
    [cacheVault, dispatch],
  );

  const loadNextCandidate = useCallback(async () => {
    if (!sorterId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setEmptyState(false);
    setImageReady(false);
    setImageFailed(false);

    const response = await getNextSortReport(sorterId);
    if (!response?.ok) {
      setCandidate(null);
      setIsLoading(false);
      if (response?.empty) {
        setEmptyState(true);
        return;
      }
      setErrorMessage(
        t('sortscreen.loadError') ||
          'Unable to load a report to sort right now.',
      );
      return;
    }

    translateX.setValue(0);
    cardOpacity.setValue(0);
    setCandidate(response.candidate);
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    setIsLoading(false);
  }, [cardOpacity, sorterId, t, translateX]);

  useEffect(() => {
    let isMounted = true;

    const loadWallet = async () => {
      const walletAddress = await getWalletAddress();
      if (!isMounted) {
        return;
      }
      if (!walletAddress) {
        setIsLoading(false);
        setErrorMessage(
          t('sortscreen.walletRequired') ||
            'A wallet is required before you can start sorting.',
        );
        return;
      }
      setSorterId(walletAddress);
    };

    loadWallet();
    return () => {
      isMounted = false;
    };
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      if (!sorterId) {
        return undefined;
      }
      loadNextCandidate();
      return undefined;
    }, [loadNextCandidate, sorterId]),
  );

  const finishSort = useCallback(
    async (verdict: SortVerdict, nextUrgency: number) => {
      if (!candidate || !sorterId || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setErrorMessage('');

      const response = await submitSortReport({
        sorterId,
        reportSeq: candidate.report.seq,
        verdict,
        urgencyScore: clampUrgency(nextUrgency),
      });

      if (!response?.ok) {
        if (response?.status === 409) {
          ToastService.show({
            type: 'info',
            text1: t('sortscreen.alreadySorted') || 'Already sorted',
            text2:
              t('sortscreen.loadingAnother') || 'Loading another report now.',
          });
          await loadNextCandidate();
          setIsSubmitting(false);
          resetGestureState();
          return;
        }

        setIsSubmitting(false);
        setErrorMessage(
          response?.error ||
            t('sortscreen.submitError') ||
            'Unable to submit that sort right now.',
        );
        resetGestureState();
        return;
      }

      const rewardKitns = Number(response.submission?.reward_kitns || 0);
      if (rewardKitns > 0) {
        setSessionSortCount(prev => prev + 1);
        setSessionKitns(prev => prev + rewardKitns);
        await incrementLocalKitns(rewardKitns);
        ToastService.success(
          `+${rewardKitns} ${t('sortscreen.kitn') || 'KITN'}`,
          'top',
          2200,
        );
      }

      setCandidate(null);
      resetGestureState();
      await loadNextCandidate();
      setIsSubmitting(false);
    },
    [
      candidate,
      incrementLocalKitns,
      isSubmitting,
      loadNextCandidate,
      resetGestureState,
      sorterId,
      t,
    ],
  );

  const animateCardOffscreen = useCallback(
    (direction: 1 | -1, callback: () => void) => {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: direction * screenWidth,
          duration: 190,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0.08,
          duration: 190,
          useNativeDriver: true,
        }),
      ]).start(() => {
        callback();
      });
    },
    [cardOpacity, translateX],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isSubmitting && !!candidate,
        onMoveShouldSetPanResponder: () => !isSubmitting && !!candidate,
        onPanResponderGrant: () => {
          startHoldAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          const {dx, dy} = gestureState;
          translateX.setValue(dx);

          if (
            !isGestureCancelledRef.current &&
            (Math.abs(dx) > HOLD_CANCEL_DISTANCE ||
              Math.abs(dy) > HOLD_CANCEL_DISTANCE)
          ) {
            isGestureCancelledRef.current = true;
            holdProgress.stopAnimation();
            holdProgress.setValue(0);
            holdValueRef.current = 0;
            setUrgencyScore(0);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const {dx} = gestureState;
          holdProgress.stopAnimation(value => {
            const heldUrgency = clampUrgency(Math.round(value * 10));

            if (dx >= SWIPE_THRESHOLD) {
              holdProgress.setValue(0);
              setUrgencyScore(0);
              animateCardOffscreen(1, () => {
                finishSort('high_value', 0);
              });
              return;
            }

            if (dx <= -SWIPE_THRESHOLD) {
              holdProgress.setValue(0);
              setUrgencyScore(0);
              animateCardOffscreen(-1, () => {
                finishSort('spam', 0);
              });
              return;
            }

            if (heldUrgency > 0) {
              holdProgress.setValue(0);
              setUrgencyScore(0);
              finishSort('spam', heldUrgency);
              return;
            }

            resetGestureState();
          });
        },
        onPanResponderTerminate: () => {
          resetGestureState();
        },
      }),
    [
      animateCardOffscreen,
      candidate,
      finishSort,
      holdProgress,
      isSubmitting,
      resetGestureState,
      startHoldAnimation,
      translateX,
    ],
  );

  const currentSortMetrics = candidate?.sort_metrics;
  const imageUrl = buildRawImageUrl(candidate?.report?.seq);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      t('sortscreen.exitTitle') || 'Exit Sort',
      t('sortscreen.exitBody') || 'Return to the main camera screen?',
      [
        {
          text: t('sortscreen.stay') || 'Stay',
          style: 'cancel',
        },
        {
          text: t('sortscreen.leave') || 'Leave',
          onPress: () => navigation.navigate('Camera' as never),
        },
      ],
    );
  }, [navigation, t]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#09110C', '#13271B', '#171717']}
        start={{x: 0.15, y: 0}}
        end={{x: 0.9, y: 1}}
        style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>
              {t('sortscreen.back') || 'Back'}
            </Text>
          </TouchableOpacity>

          <View style={styles.sessionBadge}>
            <Text style={styles.sessionBadgeValue}>{sessionKitns}</Text>
            <Text style={styles.sessionBadgeLabel}>
              {t('sortscreen.kitn') || 'KITN'}
            </Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>
            {t('sortscreen.eyebrow') || 'SORT'}
          </Text>
          <Text style={styles.title}>
            {t('sortscreen.title') ||
              'Swipe right for high value. Hold to rank urgency.'}
          </Text>
          <Text style={styles.subtitle}>
            {t('sortscreen.subtitle') ||
              'Every accepted sort pays 1 KITN for now while we train the consensus model.'}
          </Text>
        </View>

        <View style={styles.canvas}>
          <View style={styles.thermometerColumn}>
            <Text style={styles.thermometerLabel}>
              {t('sortscreen.urgency') || 'Urgency'}
            </Text>
            <View style={styles.thermometerTrack}>
              <Animated.View
                style={[
                  styles.thermometerFill,
                  {
                    height: thermometerFillHeight,
                  },
                ]}
              />
              <View style={styles.thermometerTicks}>
                {[10, 8, 6, 4, 2, 0].map(mark => (
                  <View key={mark} style={styles.tickRow}>
                    <View style={styles.tickLine} />
                    <Text style={styles.tickLabel}>{mark}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={styles.thermometerValue}>{urgencyScore}/10</Text>
          </View>

          <View style={styles.cardColumn}>
            <Animated.View
              style={[
                styles.reportCard,
                {
                  opacity: cardOpacity,
                  transform: [{translateX}, {rotate: rotation}],
                },
              ]}
              {...panResponder.panHandlers}>
              {candidate ? (
                <>
                  <Image
                    source={{uri: imageUrl}}
                    style={styles.reportImage}
                    resizeMode="cover"
                    onLoad={() => {
                      setImageReady(true);
                      setImageFailed(false);
                    }}
                    onError={() => {
                      setImageReady(false);
                      setImageFailed(true);
                    }}
                  />
                  <LinearGradient
                    colors={['rgba(9, 17, 12, 0.0)', 'rgba(9, 17, 12, 0.78)']}
                    style={styles.imageOverlay}
                  />
                  {!imageReady && !imageFailed && (
                    <View style={styles.imageLoadingOverlay}>
                      <ActivityIndicator
                        size="large"
                        color={theme.COLORS.BTN_BG_BLUE}
                      />
                    </View>
                  )}
                  {imageFailed && (
                    <View style={styles.imageLoadingOverlay}>
                      <Text style={styles.emptyCardText}>
                        {t('sortscreen.imageUnavailable') ||
                          'Image unavailable for this report.'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.cardMeta}>
                    <Text style={styles.reportIdPill}>
                      #{candidate.report.seq}
                    </Text>
                    <Text style={styles.cardHint}>
                      {t('sortscreen.cardHint') ||
                        'Swipe right = High Value  •  Swipe left or hold = Spam'}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardText}>
                    {t('sortscreen.waiting') || 'Loading your next report...'}
                  </Text>
                </View>
              )}
            </Animated.View>

            <View style={styles.statusRow}>
              <View style={styles.metricPill}>
                <Text style={styles.metricValue}>
                  {currentSortMetrics?.sort_count || 0}
                </Text>
                <Text style={styles.metricLabel}>
                  {t('sortscreen.sorts') || 'sorts'}
                </Text>
              </View>
              <View style={styles.metricPill}>
                <Text style={styles.metricValue}>
                  {formatUrgencyMean(currentSortMetrics?.urgency_mean)}
                </Text>
                <Text style={styles.metricLabel}>
                  {t('sortscreen.meanUrgency') || 'mean urgency'}
                </Text>
              </View>
              <View style={styles.metricPill}>
                <Text style={styles.metricValue}>{sessionSortCount}</Text>
                <Text style={styles.metricLabel}>
                  {t('sortscreen.session') || 'session'}
                </Text>
              </View>
            </View>

            <View style={styles.instructionsRow}>
              <View style={[styles.verdictPill, styles.spamPill]}>
                <Text style={styles.verdictLabel}>
                  {t('sortscreen.spam') || 'Spam'}
                </Text>
                <Text style={styles.verdictText}>
                  {t('sortscreen.spamHint') || 'Swipe left or hold for urgency'}
                </Text>
              </View>
              <View style={[styles.verdictPill, styles.highValuePill]}>
                <Text style={styles.verdictLabel}>
                  {t('sortscreen.highValue') || 'High Value'}
                </Text>
                <Text style={styles.verdictText}>
                  {t('sortscreen.highValueHint') || 'Swipe right'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {(isLoading || isSubmitting) && (
          <View style={styles.loadingPanel}>
            <ActivityIndicator size="large" color={theme.COLORS.BTN_BG_BLUE} />
            <Text style={styles.loadingText}>
              {isSubmitting
                ? t('sortscreen.submitting') || 'Submitting your sort...'
                : t('sortscreen.loading') || 'Loading the next report...'}
            </Text>
          </View>
        )}

        {emptyState && (
          <View style={styles.noticePanel}>
            <Text style={styles.noticeTitle}>
              {t('sortscreen.emptyTitle') || 'Queue complete'}
            </Text>
            <Text style={styles.noticeBody}>
              {t('sortscreen.emptyBody') ||
                'You have already sorted every report currently available to you.'}
            </Text>
            <TouchableOpacity
              style={styles.noticeButton}
              onPress={loadNextCandidate}>
              <Text style={styles.noticeButtonText}>
                {t('sortscreen.retry') || 'Check again'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!!errorMessage && !isLoading && (
          <View style={styles.noticePanel}>
            <Text style={styles.noticeTitle}>
              {t('sortscreen.problem') || 'Something went wrong'}
            </Text>
            <Text style={styles.noticeBody}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.noticeButton}
              onPress={loadNextCandidate}>
              <Text style={styles.noticeButtonText}>
                {t('sortscreen.retry') || 'Retry'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09110C',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(8, 10, 12, 0.46)',
  },
  backButtonText: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '600',
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(89, 228, 128, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(89, 228, 128, 0.35)',
  },
  sessionBadgeValue: {
    color: '#59E480',
    fontFamily: fontFamilies.Default,
    fontWeight: '700',
    fontSize: 18,
  },
  sessionBadgeLabel: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    opacity: 0.84,
  },
  titleBlock: {
    marginTop: 18,
    gap: 8,
  },
  eyebrow: {
    color: '#59E480',
    fontFamily: fontFamilies.Default,
    letterSpacing: 2.4,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    maxWidth: 320,
  },
  subtitle: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 340,
  },
  canvas: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 18,
  },
  thermometerColumn: {
    width: 62,
    alignItems: 'center',
    gap: 10,
  },
  thermometerLabel: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  thermometerTrack: {
    width: 44,
    height: 224,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(8, 10, 12, 0.48)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  thermometerFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    backgroundColor: '#59E480',
  },
  thermometerTicks: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tickLine: {
    width: 10,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.48)',
  },
  tickLabel: {
    color: theme.COLORS.TEXT_WHITE,
    fontSize: 10,
    fontFamily: fontFamilies.Default,
    opacity: 0.8,
  },
  thermometerValue: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '700',
    fontSize: 15,
  },
  cardColumn: {
    flex: 1,
    gap: 12,
  },
  reportCard: {
    height: Math.min(screenHeight * 0.54, 500),
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#0E1310',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  reportImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 17, 12, 0.44)',
  },
  cardMeta: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    gap: 10,
  },
  reportIdPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(8, 10, 12, 0.62)',
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '700',
  },
  cardHint: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyCardText: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricPill: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(8, 10, 12, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metricValue: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '700',
    fontSize: 20,
  },
  metricLabel: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  instructionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  verdictPill: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  spamPill: {
    backgroundColor: 'rgba(228, 95, 53, 0.14)',
    borderColor: 'rgba(228, 95, 53, 0.3)',
  },
  highValuePill: {
    backgroundColor: 'rgba(89, 228, 128, 0.12)',
    borderColor: 'rgba(89, 228, 128, 0.32)',
  },
  verdictLabel: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '700',
    fontSize: 15,
  },
  verdictText: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  loadingPanel: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(8, 10, 12, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 14,
  },
  noticePanel: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(8, 10, 12, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 10,
  },
  noticeTitle: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '700',
    fontSize: 18,
  },
  noticeBody: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    lineHeight: 20,
  },
  noticeButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#59E480',
  },
  noticeButtonText: {
    color: '#09110C',
    fontFamily: fontFamilies.Default,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default SortScreen;
