import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
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

import {GetOrCreateLocalWallet} from '../functions/login';
import {fontFamilies} from '../utils/fontFamilies';
import {theme} from '../services/Common/theme';
import {getUrls} from '../services/API/Settings';
import {getNextSortReport, submitSortReport} from '../services/API/APIManager';
import {getWalletAddress, setCacheVault} from '../services/DataManager';
import {ToastService} from '../components/ToastifyToast';
import {useStateValue} from '../services/State/State';
import {actions} from '../services/State/Reducer';

const {width: screenWidth} = Dimensions.get('window');

const SWIPE_THRESHOLD = 110;
const HOLD_CANCEL_DISTANCE = 18;
const HOLD_DURATION_MS = 3000;
const THERMOMETER_HEIGHT = 168;
const SORT_FETCH_ATTEMPTS = 8;

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

interface PreparedSortCandidate {
  candidate: SortCandidate;
  imageUrl: string;
  prefetched: boolean;
}

interface CandidateLoadResult {
  ok: boolean;
  prepared?: PreparedSortCandidate;
  empty?: boolean;
  error?: string;
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

const SortScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const [{cacheVault}, dispatch] = useStateValue();

  const [sorterId, setSorterId] = useState('');
  const [activeCard, setActiveCard] = useState<PreparedSortCandidate | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [urgencyScore, setUrgencyScore] = useState(0);
  const [sessionKitns, setSessionKitns] = useState(0);
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const holdProgress = useRef(new Animated.Value(0)).current;
  const holdValueRef = useRef(0);
  const isGestureCancelledRef = useRef(false);
  const prefetchedCardRef = useRef<PreparedSortCandidate | null>(null);
  const prefetchSourceSeqRef = useRef<number | null>(null);
  const prefetchPromiseRef = useRef<Promise<CandidateLoadResult> | null>(null);

  const rotation = useMemo(
    () =>
      translateX.interpolate({
        inputRange: [-screenWidth * 0.6, 0, screenWidth * 0.6],
        outputRange: ['-8deg', '0deg', '8deg'],
        extrapolate: 'clamp',
      }),
    [translateX],
  );

  const spamCueOpacity = useMemo(
    () =>
      translateX.interpolate({
        inputRange: [-screenWidth * 0.4, -40, 0],
        outputRange: [1, 0.72, 0.3],
        extrapolate: 'clamp',
      }),
    [translateX],
  );

  const highValueCueOpacity = useMemo(
    () =>
      translateX.interpolate({
        inputRange: [0, 40, screenWidth * 0.4],
        outputRange: [0.3, 0.72, 1],
        extrapolate: 'clamp',
      }),
    [translateX],
  );

  const cuePulse = useRef(new Animated.Value(0)).current;

  const thermometerFillHeight = useMemo(
    () =>
      holdProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, THERMOMETER_HEIGHT],
        extrapolate: 'clamp',
      }),
    [holdProgress],
  );

  const leftArrowTranslateX = useMemo(
    () =>
      cuePulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
      }),
    [cuePulse],
  );

  const rightArrowTranslateX = useMemo(
    () =>
      cuePulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 10],
      }),
    [cuePulse],
  );

  const cueGlowOpacity = useMemo(
    () =>
      cuePulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.45, 0.9],
      }),
    [cuePulse],
  );

  const cueScale = useMemo(
    () =>
      cuePulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.08],
      }),
    [cuePulse],
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

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cuePulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cuePulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
      cuePulse.stopAnimation();
    };
  }, [cuePulse]);

  const clearGestureValues = useCallback(() => {
    holdProgress.stopAnimation();
    holdProgress.setValue(0);
    holdValueRef.current = 0;
    setUrgencyScore(0);
    isGestureCancelledRef.current = false;
    translateX.stopAnimation();
    translateX.setValue(0);
  }, [holdProgress, translateX]);

  const resetGestureState = useCallback(() => {
    clearGestureValues();

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
        tension: 90,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, clearGestureValues, translateX]);

  const startHoldAnimation = useCallback(() => {
    holdProgress.stopAnimation();
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

  const stagePreparedCandidate = useCallback(
    (prepared: PreparedSortCandidate) => {
      clearGestureValues();
      cardOpacity.stopAnimation();
      cardOpacity.setValue(0);
      setActiveCard(prepared);
      setImageReady(prepared.prefetched);
      setImageFailed(false);
      setErrorMessage('');
      setEmptyState(false);
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [cardOpacity, clearGestureValues],
  );

  const clearPrefetchedCandidate = useCallback(() => {
    prefetchedCardRef.current = null;
    prefetchSourceSeqRef.current = null;
    prefetchPromiseRef.current = null;
  }, []);

  const incrementLocalKitns = useCallback(
    (rewardKitns: number) => {
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
      void setCacheVault(nextCacheVault);
    },
    [cacheVault, dispatch],
  );

  const fetchPreparedCandidate = useCallback(
    async (excludedReportSeqs: number[] = []): Promise<CandidateLoadResult> => {
      if (!sorterId) {
        return {
          ok: false,
          error:
            t('sortscreen.loadError') ||
            'Unable to load a report to sort right now.',
        };
      }

      const excludedSeqSet = new Set(
        excludedReportSeqs.filter(seq => Number.isInteger(seq) && seq > 0),
      );

      for (let attempt = 0; attempt < SORT_FETCH_ATTEMPTS; attempt += 1) {
        const response = await getNextSortReport(
          sorterId,
          Array.from(excludedSeqSet),
        );
        if (!response?.ok) {
          if (response?.empty) {
            return {
              ok: false,
              empty: true,
            };
          }

          return {
            ok: false,
            error:
              response?.error ||
              t('sortscreen.loadError') ||
              'Unable to load a report to sort right now.',
          };
        }

        const nextCandidate = response.candidate;
        const nextSeq = nextCandidate?.report?.seq;
        if (!nextSeq || excludedSeqSet.has(nextSeq)) {
          continue;
        }

        excludedSeqSet.add(nextSeq);
        const imageUrl = buildRawImageUrl(nextSeq);
        if (!imageUrl) {
          continue;
        }

        let prefetched = false;
        try {
          prefetched = await Image.prefetch(imageUrl);
        } catch (err) {
          prefetched = false;
        }

        if (!prefetched) {
          continue;
        }

        return {
          ok: true,
          prepared: {
            candidate: nextCandidate,
            imageUrl,
            prefetched,
          },
        };
      }

      return {
        ok: false,
        error:
          t('sortscreen.loadError') ||
          'Unable to load a report to sort right now.',
      };
    },
    [sorterId, t],
  );

  const applyCandidateLoadResult = useCallback(
    (result: CandidateLoadResult) => {
      if (result.ok && result.prepared) {
        stagePreparedCandidate(result.prepared);
        return;
      }

      setActiveCard(null);
      setImageReady(false);
      setImageFailed(false);
      if (result.empty) {
        setEmptyState(true);
        setErrorMessage('');
        return;
      }

      setEmptyState(false);
      setErrorMessage(
        result.error ||
          t('sortscreen.loadError') ||
          'Unable to load a report to sort right now.',
      );
    },
    [stagePreparedCandidate, t],
  );

  const loadFreshCandidate = useCallback(
    async (excludedReportSeqs: number[] = []) => {
      if (!sorterId) {
        return;
      }

      setIsLoading(true);
      setErrorMessage('');
      setEmptyState(false);
      setImageReady(false);
      setImageFailed(false);
      clearPrefetchedCandidate();

      const result = await fetchPreparedCandidate(excludedReportSeqs);
      applyCandidateLoadResult(result);
      setIsLoading(false);
    },
    [
      applyCandidateLoadResult,
      clearPrefetchedCandidate,
      fetchPreparedCandidate,
      sorterId,
    ],
  );

  const queueNextCandidatePrefetch = useCallback(
    (currentSeq?: number) => {
      if (!sorterId || !currentSeq) {
        return Promise.resolve<CandidateLoadResult | null>(null);
      }

      if (
        prefetchedCardRef.current &&
        prefetchSourceSeqRef.current === currentSeq
      ) {
        return Promise.resolve<CandidateLoadResult>({
          ok: true,
          prepared: prefetchedCardRef.current,
        });
      }

      if (
        prefetchPromiseRef.current &&
        prefetchSourceSeqRef.current === currentSeq
      ) {
        return prefetchPromiseRef.current;
      }

      prefetchSourceSeqRef.current = currentSeq;
      const promise = fetchPreparedCandidate([currentSeq])
        .then(result => {
          if (prefetchSourceSeqRef.current !== currentSeq) {
            return result;
          }
          prefetchedCardRef.current =
            result.ok && result.prepared ? result.prepared : null;
          return result;
        })
        .finally(() => {
          if (prefetchSourceSeqRef.current === currentSeq) {
            prefetchPromiseRef.current = null;
          }
        });

      prefetchPromiseRef.current = promise;
      return promise;
    },
    [fetchPreparedCandidate, sorterId],
  );

  useEffect(() => {
    let isMounted = true;

    const resolveSorterId = async () => {
      setIsLoading(true);
      setErrorMessage('');

      let nextSorterId = await getWalletAddress();

      if (!nextSorterId) {
        const walletReady = await GetOrCreateLocalWallet();
        if (walletReady) {
          nextSorterId = await getWalletAddress();
        }
      }

      if (!isMounted) {
        return;
      }

      if (!nextSorterId) {
        setIsLoading(false);
        setErrorMessage(
          t('sortscreen.loadError') ||
            'Unable to load a report to sort right now.',
        );
        return;
      }

      setSorterId(String(nextSorterId));
    };

    resolveSorterId();

    return () => {
      isMounted = false;
    };
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      if (!sorterId) {
        return undefined;
      }

      if (!activeCard && !isSubmitting) {
        void loadFreshCandidate();
        return undefined;
      }

      if (activeCard?.candidate?.report?.seq && !isSubmitting) {
        void queueNextCandidatePrefetch(activeCard.candidate.report.seq);
      }
      return undefined;
    }, [
      activeCard,
      isSubmitting,
      loadFreshCandidate,
      queueNextCandidatePrefetch,
      sorterId,
    ]),
  );

  useEffect(() => {
    const currentSeq = activeCard?.candidate?.report?.seq;
    if (!sorterId || !currentSeq || isSubmitting) {
      return;
    }

    void queueNextCandidatePrefetch(currentSeq);
  }, [activeCard, isSubmitting, queueNextCandidatePrefetch, sorterId]);

  const handleImageLoadError = useCallback(() => {
    const failedSeq = activeCard?.candidate?.report?.seq;

    setImageReady(false);
    setImageFailed(false);

    if (!failedSeq || isLoading || isSubmitting) {
      setImageFailed(true);
      return;
    }

    setActiveCard(null);
    void loadFreshCandidate([failedSeq]);
  }, [activeCard, isLoading, isSubmitting, loadFreshCandidate]);

  const finishSort = useCallback(
    async (verdict: SortVerdict, nextUrgency: number) => {
      const currentCandidate = activeCard?.candidate;
      const currentSeq = currentCandidate?.report?.seq;
      if (!currentCandidate || !currentSeq || !sorterId || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setErrorMessage('');

      const nextCandidatePromise =
        prefetchedCardRef.current && prefetchSourceSeqRef.current === currentSeq
          ? Promise.resolve<CandidateLoadResult>({
              ok: true,
              prepared: prefetchedCardRef.current,
            })
          : queueNextCandidatePrefetch(currentSeq).then(
              result =>
                result || {
                  ok: false,
                  error:
                    t('sortscreen.loadError') ||
                    'Unable to load a report to sort right now.',
                },
            );

      const response = await submitSortReport({
        sorterId,
        reportSeq: currentSeq,
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

          const nextResult = await nextCandidatePromise;
          if (prefetchSourceSeqRef.current === currentSeq) {
            clearPrefetchedCandidate();
          }
          applyCandidateLoadResult(nextResult);
          setIsSubmitting(false);
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
        setSessionKitns(prev => prev + rewardKitns);
        incrementLocalKitns(rewardKitns);
        ToastService.success(
          `+${rewardKitns} ${t('sortscreen.kitn') || 'KITN'}`,
          'top',
          2200,
        );
      }

      const nextResult = await nextCandidatePromise;
      if (prefetchSourceSeqRef.current === currentSeq) {
        clearPrefetchedCandidate();
      }
      applyCandidateLoadResult(nextResult);
      setIsSubmitting(false);
    },
    [
      activeCard,
      applyCandidateLoadResult,
      clearPrefetchedCandidate,
      incrementLocalKitns,
      isSubmitting,
      queueNextCandidatePrefetch,
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
        onStartShouldSetPanResponder: () =>
          !isSubmitting &&
          !!activeCard?.candidate &&
          imageReady &&
          !imageFailed &&
          !errorMessage &&
          !emptyState,
        onMoveShouldSetPanResponder: () =>
          !isSubmitting &&
          !!activeCard?.candidate &&
          imageReady &&
          !imageFailed &&
          !errorMessage &&
          !emptyState,
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
            holdProgress.setValue(0);

            if (dx >= SWIPE_THRESHOLD) {
              setUrgencyScore(0);
              animateCardOffscreen(1, () => {
                finishSort('high_value', 0);
              });
              return;
            }

            if (heldUrgency > 0) {
              setUrgencyScore(0);
              animateCardOffscreen(-1, () => {
                finishSort('spam', heldUrgency);
              });
              return;
            }

            if (dx <= -SWIPE_THRESHOLD) {
              setUrgencyScore(0);
              animateCardOffscreen(-1, () => {
                finishSort('spam', 0);
              });
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
      activeCard,
      animateCardOffscreen,
      emptyState,
      errorMessage,
      finishSort,
      holdProgress,
      imageFailed,
      imageReady,
      isSubmitting,
      resetGestureState,
      startHoldAnimation,
      translateX,
    ],
  );

  const candidate = activeCard?.candidate || null;
  const imageUrl = activeCard?.imageUrl || '';

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Camera' as never);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.stage}>
          <Animated.View
            style={[
              styles.surface,
              {
                opacity: cardOpacity,
                transform: [{translateX}, {rotate: rotation}],
              },
            ]}
            {...panResponder.panHandlers}>
            {candidate ? (
              <Image
                source={{uri: imageUrl}}
                style={styles.reportImage}
                resizeMode="cover"
                onLoad={() => {
                  setImageReady(true);
                  setImageFailed(false);
                }}
                onError={handleImageLoadError}
              />
            ) : (
              <View style={styles.reportFallback} />
            )}

            <LinearGradient
              colors={[
                'rgba(3, 8, 5, 0.72)',
                'rgba(3, 8, 5, 0.10)',
                'rgba(3, 8, 5, 0.82)',
              ]}
              locations={[0, 0.42, 1]}
              style={StyleSheet.absoluteFill}
            />

            {candidate && (
              <>
                <View pointerEvents="none" style={styles.centerHintPill}>
                  <Text style={styles.centerHintText}>
                    Hold to rate urgency
                  </Text>
                </View>

                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.sideCue,
                    styles.sideCueLeft,
                    {opacity: spamCueOpacity},
                  ]}>
                  <Animated.View
                    style={[
                      styles.sideCueArrowBadge,
                      styles.sideCueArrowBadgeLeft,
                      {
                        opacity: cueGlowOpacity,
                        transform: [
                          {translateX: leftArrowTranslateX},
                          {scale: cueScale},
                        ],
                      },
                    ]}>
                    <Text
                      style={[styles.sideCueArrow, styles.sideCueArrowLeft]}>
                      ←
                    </Text>
                  </Animated.View>
                  <Text style={styles.sideCueDirection}>Swipe left</Text>
                  <Text style={styles.sideCueLabel}>
                    {t('sortscreen.spam') || 'Spam'}
                  </Text>
                  <Text style={styles.sideCueMeta}>Low signal or junk</Text>
                </Animated.View>

                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.sideCue,
                    styles.sideCueRight,
                    {opacity: highValueCueOpacity},
                  ]}>
                  <Animated.View
                    style={[
                      styles.sideCueArrowBadge,
                      styles.sideCueArrowBadgeRight,
                      {
                        opacity: cueGlowOpacity,
                        transform: [
                          {translateX: rightArrowTranslateX},
                          {scale: cueScale},
                        ],
                      },
                    ]}>
                    <Text
                      style={[styles.sideCueArrow, styles.sideCueArrowRight]}>
                      →
                    </Text>
                  </Animated.View>
                  <Text style={styles.sideCueDirection}>Swipe right</Text>
                  <Text style={styles.sideCueLabel}>
                    {t('sortscreen.highValue') || 'High Value'}
                  </Text>
                  <Text style={styles.sideCueMeta}>Worth escalating</Text>
                </Animated.View>

                <View pointerEvents="none" style={styles.thermometerDock}>
                  <Text style={styles.thermometerTitle}>
                    {t('sortscreen.urgency') || 'Urgency'}
                  </Text>
                  <View style={styles.thermometerWrap}>
                    <Animated.View
                      style={[
                        styles.thermometerFill,
                        {height: thermometerFillHeight},
                      ]}
                    />
                    <View style={styles.thermometerScale}>
                      <Text style={styles.thermometerScaleText}>10</Text>
                      <View style={styles.thermometerDivider} />
                      <Text style={styles.thermometerScaleText}>0</Text>
                    </View>
                  </View>
                  <View style={styles.thermometerScorePill}>
                    <Text style={styles.thermometerScoreValue}>
                      {urgencyScore}
                    </Text>
                  </View>
                </View>

                <View pointerEvents="none" style={styles.reportChip}>
                  <Text style={styles.reportChipText}>
                    Report #{candidate.report.seq}
                  </Text>
                </View>
              </>
            )}

            {!imageReady && !imageFailed && candidate && !isLoading && (
              <View style={styles.imageStateOverlay}>
                <ActivityIndicator
                  size="large"
                  color={theme.COLORS.BTN_BG_BLUE}
                />
              </View>
            )}

            {imageFailed && candidate && !isLoading && (
              <View style={styles.centerPanel}>
                <Text style={styles.panelTitle}>
                  {t('sortscreen.problem') || 'Something went wrong'}
                </Text>
                <Text style={styles.panelBody}>
                  {t('sortscreen.imageUnavailable') ||
                    'Image unavailable for this report.'}
                </Text>
              </View>
            )}

            {isLoading && !candidate && (
              <View style={styles.centerPanel}>
                <ActivityIndicator
                  size="large"
                  color={theme.COLORS.BTN_BG_BLUE}
                />
                <Text style={styles.panelBody}>
                  {t('sortscreen.waiting') || 'Loading your next report...'}
                </Text>
              </View>
            )}

            {isSubmitting && (
              <View style={styles.statusDock}>
                <ActivityIndicator
                  size="small"
                  color={theme.COLORS.BTN_BG_BLUE}
                />
                <Text style={styles.statusDockText}>
                  {t('sortscreen.submitting') || 'Submitting your sort...'}
                </Text>
              </View>
            )}

            {emptyState && !isLoading && (
              <View style={styles.centerPanel}>
                <Text style={styles.panelTitle}>
                  {t('sortscreen.emptyTitle') || 'Queue complete'}
                </Text>
                <Text style={styles.panelBody}>
                  {t('sortscreen.emptyBody') ||
                    'You have already sorted every report currently available to you.'}
                </Text>
                <TouchableOpacity
                  style={styles.panelButton}
                  onPress={() => {
                    void loadFreshCandidate();
                  }}>
                  <Text style={styles.panelButtonText}>
                    {t('sortscreen.retry') || 'Check again'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!!errorMessage && !isLoading && (
              <View style={styles.centerPanel}>
                <Text style={styles.panelTitle}>
                  {t('sortscreen.problem') || 'Something went wrong'}
                </Text>
                <Text style={styles.panelBody}>{errorMessage}</Text>
                <TouchableOpacity
                  style={styles.panelButton}
                  onPress={() => {
                    void loadFreshCandidate();
                  }}>
                  <Text style={styles.panelButtonText}>
                    {t('sortscreen.retry') || 'Retry'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          <View pointerEvents="box-none" style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>
                {t('sortscreen.back') || 'Back'}
              </Text>
            </TouchableOpacity>

            <View style={styles.kitnBadge}>
              <Text style={styles.kitnValue}>{sessionKitns}</Text>
              <Text style={styles.kitnLabel}>
                {t('sortscreen.kitn') || 'KITN'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#06100A',
  },
  container: {
    flex: 1,
    backgroundColor: '#06100A',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  stage: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#050806',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  surface: {
    flex: 1,
    backgroundColor: '#050806',
  },
  reportImage: {
    width: '100%',
    height: '100%',
  },
  reportFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#08110C',
  },
  topBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(5, 8, 6, 0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backButtonText: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 14,
  },
  kitnBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 192, 136, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(89, 228, 128, 0.34)',
  },
  kitnValue: {
    color: '#8AF5A7',
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 18,
  },
  kitnLabel: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    opacity: 0.84,
  },
  centerHintPill: {
    position: 'absolute',
    top: 74,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(5, 8, 6, 0.56)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  centerHintText: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  sideCue: {
    position: 'absolute',
    top: '31%',
    width: 144,
    minHeight: 112,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 16,
    borderRadius: 26,
    backgroundColor: 'rgba(4, 7, 5, 0.78)',
    borderWidth: 1.4,
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 9,
  },
  sideCueLeft: {
    left: 14,
    borderColor: 'rgba(255, 138, 90, 0.78)',
  },
  sideCueRight: {
    right: 14,
    borderColor: 'rgba(129, 243, 163, 0.78)',
  },
  sideCueArrowBadge: {
    position: 'absolute',
    top: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sideCueArrowBadgeLeft: {
    left: 14,
    backgroundColor: 'rgba(255, 124, 78, 0.18)',
    borderColor: 'rgba(255, 157, 118, 0.42)',
  },
  sideCueArrowBadgeRight: {
    right: 14,
    backgroundColor: 'rgba(111, 242, 155, 0.18)',
    borderColor: 'rgba(149, 244, 176, 0.42)',
  },
  sideCueArrow: {
    fontSize: 30,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.TEXT_WHITE,
    textShadowColor: 'rgba(0,0,0,0.42)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 12,
  },
  sideCueArrowLeft: {
    color: '#FF9D76',
  },
  sideCueArrowRight: {
    color: '#95F4B0',
  },
  sideCueDirection: {
    color: 'rgba(255,255,255,0.74)',
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sideCueLabel: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 18,
    textShadowColor: 'rgba(0,0,0,0.34)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 8,
  },
  sideCueMeta: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    opacity: 0.92,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.28)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 6,
  },
  thermometerDock: {
    position: 'absolute',
    left: 14,
    bottom: 24,
    alignItems: 'center',
    gap: 8,
  },
  thermometerTitle: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  thermometerWrap: {
    width: 46,
    height: THERMOMETER_HEIGHT,
    borderRadius: 24,
    backgroundColor: 'rgba(5, 8, 6, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  thermometerFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#25C088',
  },
  thermometerScale: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  thermometerScaleText: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 10,
    opacity: 0.84,
  },
  thermometerDivider: {
    flex: 1,
  },
  thermometerScorePill: {
    minWidth: 38,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(5, 8, 6, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  thermometerScoreValue: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 16,
  },
  reportChip: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
    alignItems: 'center',
  },
  reportChipText: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 13,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(5, 8, 6, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  imageStateOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 8, 6, 0.36)',
  },
  statusDock: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(5, 8, 6, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  statusDockText: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 15,
  },
  centerPanel: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 34,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(5, 8, 6, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    gap: 10,
  },
  panelTitle: {
    color: theme.COLORS.TEXT_WHITE,
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 22,
    textAlign: 'center',
  },
  panelBody: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  panelButton: {
    marginTop: 2,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: '#59E480',
  },
  panelButtonText: {
    color: '#06100A',
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 14,
  },
});

export default SortScreen;
