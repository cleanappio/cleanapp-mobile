/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  AppState,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  Linking,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Reanimated, {
  Extrapolation,
  runOnJS,
  interpolate,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ImageResizer from '@bam.tech/react-native-image-resizer';

import { theme } from '../services/Common/theme';
import { fontFamilies } from '../utils/fontFamilies';
import CheckBigIcon from '../assets/ico_check_big.svg';
import TargetIcon from '../assets/ico_target.svg';
import { BlurView } from '@react-native-community/blur';
import { useTranslation } from 'react-i18next';
import { report, matchReports } from '../services/API/APIManager';
import { getLocation } from '../functions/geolocation';
import { getWalletAddress } from '../services/DataManager';
import { ToastService } from '../components/ToastifyToast';

import Svg, { Circle } from 'react-native-svg';

const ROTATION_DURATION_MS = 3800;
const CLEANAPP_DARK_GREEN = '#2F7A45';

// StoryCrosshair: Animated dial that tells the CleanApp story
const StoryCrosshair = ({ currentPrompt, isActive, rotationKey }) => {
  const MOTIF_ROTATIONS_INTERVAL = 4;
  const { width } = Dimensions.get('window');
  // Dimensions for the crosshair container
  // The original target View was width / 1.5
  const containerSize = width / 1.5;
  const radius = containerSize / 2;
  const ringStrokeWidth = (2 * containerSize) / 256;
  const arcStrokeWidth = ringStrokeWidth * 10;
  const center = containerSize / 2;
  const arcRadius = radius - arcStrokeWidth / 2 - 2; // sits just outside the crosshair ring
  const circumference = 2 * Math.PI * arcRadius;
  const arcDegrees = 144;
  const arcFraction = arcDegrees / 360;
  const arcLength = circumference * arcFraction;
  const tailDashOffset = circumference - arcLength;
  const sliceCount = 32;
  const sliceLength = arcLength / sliceCount;

  const [showMotifSequence, setShowMotifSequence] = useState(false);
  const rotationCountRef = useRef(0);
  const lastRotationKeyRef = useRef(rotationKey);

  // Animation Loop (3.8s) using RN Animated for reliable SVG rotation
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) {
      progress.stopAnimation();
      return undefined;
    }
    // Restart the rotation whenever the top CTA changes so everything syncs.
    progress.setValue(0);
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: ROTATION_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [isActive, rotationKey, progress]);

  useEffect(() => {
    if (!isActive) {
      setShowMotifSequence(false);
      return;
    }
    if (lastRotationKeyRef.current !== rotationKey) {
      rotationCountRef.current += 1;
      lastRotationKeyRef.current = rotationKey;
    }
    setShowMotifSequence(
      rotationCountRef.current > 0 &&
        rotationCountRef.current % MOTIF_ROTATIONS_INTERVAL === 0
    );
  }, [isActive, rotationKey]);

  const spin = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const topPillText = showMotifSequence ? '1. REPORT' : currentPrompt;
  const rightPillText = showMotifSequence ? '2. REVIEW' : 'AI analysis';
  const leftPillText =
    showMotifSequence ? '3. RESPOND' : 'Sent for action';

  // Opacity for labels based on progress
  // 0-33%: 12 o'clock
  // 33-66%: 4 o'clock
  // 66-100%: 8 o'clock
  const label1Opacity = progress.interpolate({
    inputRange: [0, 0.06, 0.82, 0.94],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });
  const label1Scale = progress.interpolate({
    inputRange: [0, 0.08, 0.2],
    outputRange: [0.98, 1, 1],
    extrapolate: 'clamp',
  });
  const label1TranslateY = progress.interpolate({
    inputRange: [0, 0.08, 0.2],
    outputRange: [6, 0, 0],
    extrapolate: 'clamp',
  });

  const label2Opacity = progress.interpolate({
    // Centered around 4 o'clock (~0.33)
    inputRange: [0.28, 0.34, 0.82, 0.94],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });
  const label2Scale = progress.interpolate({
    inputRange: [0.28, 0.36, 0.48],
    outputRange: [0.98, 1, 1],
    extrapolate: 'clamp',
  });
  const label2TranslateY = progress.interpolate({
    inputRange: [0.28, 0.36, 0.48],
    outputRange: [8, 0, 0],
    extrapolate: 'clamp',
  });

  const label3Opacity = progress.interpolate({
    // Centered around 8 o'clock (~0.66)
    inputRange: [0.58, 0.64, 0.82, 0.94],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });
  const label3Scale = progress.interpolate({
    inputRange: [0.58, 0.66, 0.78],
    outputRange: [0.98, 1, 1],
    extrapolate: 'clamp',
  });
  const label3TranslateY = progress.interpolate({
    inputRange: [0.58, 0.66, 0.78],
    outputRange: [8, 0, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ width: containerSize, height: containerSize, justifyContent: 'center', alignItems: 'center' }}>
      {/* 1. Underlying Crosshair Icon */}
      <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }]}>
        <TargetIcon width={containerSize} height={containerSize} />
      </View>

      {/* Normal CTA + Explainers */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Animated Dial Sweep */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                transform: [{ rotate: '180deg' }, { rotate: spin }],
              },
            ]}
          >
            <Svg width={containerSize} height={containerSize}>
              {Array.from({ length: sliceCount }).map((_, index) => {
                const alpha = (1 - index / (sliceCount - 1)) * 0.6;
                const dashOffset = tailDashOffset + index * sliceLength;
                return (
                  <Circle
                    key={`sweep-slice-${index}`}
                    cx={center}
                    cy={center}
                    r={arcRadius}
                    stroke="#59E480"
                    strokeOpacity={alpha}
                    strokeWidth={arcStrokeWidth}
                    strokeDasharray={`${sliceLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="butt"
                    fill="none"
                    rotation="-90" // Start at 12 o'clock
                    origin={`${center}, ${center}`}
                  />
                );
              })}
            </Svg>
          </Animated.View>
        </View>

        {/* 12 o'clock: You Report (Carousel) */}
        <Animated.View
          style={[
            styles.storyLabelContainer,
            {
            top: -82,
            left: 0,
            right: 0,
            alignItems: 'center',
            opacity: label1Opacity,
              transform: [{ scale: label1Scale }, { translateY: label1TranslateY }],
            },
          ]}
        >
          <View
            style={[
              styles.blurviewStory,
              styles.topStoryPill,
              showMotifSequence ? styles.motifGreenPill : styles.normalPillDim,
            ]}
          >
            <Text style={styles.storyText}>{topPillText}</Text>
          </View>
        </Animated.View>

        {/* 4 o'clock: AI Analyzes */}
        <Animated.View
          style={[
            styles.storyLabelContainer,
            {
              bottom: -26,
              right: -56,
              opacity: label2Opacity,
              transform: [{ scale: label2Scale }, { translateY: label2TranslateY }],
            },
          ]}
        >
          <View
            style={[
              styles.blurviewStory,
              showMotifSequence ? styles.motifGreenPill : styles.normalPillDim,
            ]}
          >
            <Text style={styles.storyText}>{rightPillText}</Text>
          </View>
        </Animated.View>

        {/* 8 o'clock: Report Sent */}
        <Animated.View
          style={[
            styles.storyLabelContainer,
            {
              bottom: -26,
              left: -56,
              opacity: label3Opacity,
              transform: [{ scale: label3Scale }, { translateY: label3TranslateY }],
            },
          ]}
        >
          <View
            style={[
              styles.blurviewStory,
              showMotifSequence ? styles.motifGreenPill : styles.normalPillDim,
            ]}
          >
            <Text style={styles.storyText}>{leftPillText}</Text>
          </View>
        </Animated.View>
      </View>

    </View>
  );
};

const tapSpotDiameter = 450;

Reanimated.addWhitelistedNativeProps({
  zoom: true,
});
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);

// Premium shutter flash - radiates from bullseye center
const ShutterFlash = ({ isActive }) => {
  const { width, height } = Dimensions.get('window');

  // Bullseye center is offset 50px above screen center
  const bullseyeCenterY = height / 2 - 50;
  const bullseyeCenterX = width / 2;

  // Core animation values
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const flashScale = useRef(new Animated.Value(0.1)).current;
  const ringScale = useRef(new Animated.Value(0.2)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const glowIntensity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Reset
      flashOpacity.setValue(0);
      flashScale.setValue(0.1);
      ringScale.setValue(0.2);
      ringOpacity.setValue(0);
      glowIntensity.setValue(0);

      // STAGE 1: Flash BURSTS from bullseye center
      Animated.parallel([
        // Flash appears
        Animated.sequence([
          Animated.timing(flashOpacity, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.delay(100),
          Animated.timing(flashOpacity, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
        // Flash expands from bullseye
        Animated.timing(flashScale, {
          toValue: 3,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // STAGE 2: Bold ring expands from bullseye
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(ringOpacity, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(ringScale, {
            toValue: 4,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();

        // Ring fades as it expands
        setTimeout(() => {
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }).start();
        }, 250);
      }, 80);

      // STAGE 3: Edge glow pulse
      Animated.sequence([
        Animated.timing(glowIntensity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(glowIntensity, {
          toValue: 0.4,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(glowIntensity, {
          toValue: 0.8,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(glowIntensity, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive]);

  if (!isActive) return null;

  // Ring size - starts smaller for more dramatic expansion
  const ringSize = width * 0.6;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* FLASH - circular, radiates from bullseye */}
      <Animated.View
        style={{
          position: 'absolute',
          top: bullseyeCenterY - width,
          left: bullseyeCenterX - width,
          width: width * 2,
          height: width * 2,
          borderRadius: width,
          backgroundColor: '#59E480',
          opacity: flashOpacity,
          transform: [{ scale: flashScale }],
        }}
      />

      {/* RING - expands from bullseye */}
      <Animated.View
        style={{
          position: 'absolute',
          top: bullseyeCenterY - ringSize / 2,
          left: bullseyeCenterX - ringSize / 2,
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: 5,
          borderColor: '#FFFFFF',
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
          shadowColor: '#59E480',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 25,
        }}
      />

      {/* Edge glow frame */}
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          borderWidth: 6,
          borderColor: '#59E480',
          opacity: glowIntensity,
          shadowColor: '#59E480',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 40,
        }}
      />
    </View>
  );
};

// Animated reward circle - lightweight animations using native driver
// These run on the native UI thread, not JS, so zero performance impact on older phones
const RewardCircle = ({ t }) => {
  const { width, height } = Dimensions.get('screen');

  // Animation values - all use native driver for performance
  const circleScale = useRef(new Animated.Value(0.8)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Circle fades in and starts pulsating
    Animated.timing(circleOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Gentle pulsate animation - loops continuously
    Animated.loop(
      Animated.sequence([
        Animated.timing(circleScale, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(circleScale, {
          toValue: 0.95,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Checkmark pops in, then grows bigger before disappearing
    Animated.sequence([
      // Pop in
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      // Hold briefly
      Animated.delay(400),
      // Grow big
      Animated.timing(checkmarkScale, {
        toValue: 1.4,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Text fades in after checkmark pops
    setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 200);
  }, []);

  // Bullseye center position
  const centerY = height / 2 - 50 - 100;
  const centerX = width / 2 - 100;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: centerY,
        left: centerX,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: circleOpacity,
        transform: [{ scale: circleScale }],
      }}>
      <Animated.Text
        style={{
          fontSize: 56,
          transform: [{ scale: checkmarkScale }],
        }}>
        ✅
      </Animated.Text>
      <Animated.Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginTop: 12,
          color: '#59E480',
          opacity: textOpacity,
        }}>
        {t('camerascreen.newreward')}
      </Animated.Text>
    </Animated.View>
  );
};

// Rotating carousel of fun prompts with emojis
const CLEANAPP_PROMPTS = [
  // Core civic & physical world (CleanApp as a verb)
  'CleanApp trash overflow 🗑️',
  'CleanApp hazards ⚠️',
  'CleanApp potholes 🕳️',
  'CleanApp broken sidewalks 🚧',
  'CleanApp streetlights out 💡',
  'CleanApp blocked bike lanes 🚴',
  'CleanApp flooding 🌊',
  'CleanApp fallen trees 🌳',
  'CleanApp graffiti 🎨',
  'CleanApp damaged signs 🚏',

  'CleanApp broken benches 🪑',
  'CleanApp cracked windows 🪟',
  'CleanApp broken doors 🚪',
  'CleanApp leaks 🚰',
  'CleanApp exposed wires ⚡',
  'CleanApp fire hazards 🔥',
  'CleanApp sinkholes 🕳️',
  'CleanApp trip hazards 🚶',
  'CleanApp accessibility issues ♿',
  'CleanApp overgrown plants 🌿',

  'CleanApp sidewalk obstructions',
  'CleanApp illegal dumping 📦',
  'CleanApp unsafe crossings 🚦',
  'CleanApp damaged railings',
  'CleanApp ice patches 🧊',

  // Digital & service issues (Report for clarity)
  'Report app crashes 💥',
  'Report login issues 🔑',
  'Report payment issues 💳',
  'Report billing errors 🧾',
  'Report upload failures ⬆️',
  'Report slow performance 🐢',
  'Report sync issues 🔄',
  'Report camera issues 📷',
  'Report map errors 🗺️',
  'Report GPS issues 📍',
  'Report AI slop 🤖',
  'CleanApp buggy apps 🐛',
  'CleanApp bad websites 🌐',
  'Report broken websites',
  'CleanApp spam sites 🗑️',
  'Report scam pages 🚨',
  'CleanApp fake content',
  'Report rogue AI agents',
  'CleanApp junk apps',
  'Report misleading links',
  'CleanApp low-quality AI',
  'Report bot spam',
  'CleanApp clickbait',
  'Report deceptive ads',
  'CleanApp broken forms',
  'Report shady behavior',
  'CleanApp bad UX',
  'Report things that feel off',
  'CleanApp digital trash',
  'Report online nonsense',

  // Trust, safety, integrity (Report only)
  'Report scams 🛒',
  'Report phishing 🕵️',
  'Report fake profiles 👤',
  'Report suspicious logins 🔐',
  'Report account issues 🔒',
  'Report data exposure 🗂️',
  'Report security issues 🛡️',

  // Catch-alls (psychologically critical)
  'CleanApp anything broken',
  'CleanApp anything wrong',
  'Report a problem',
  'Report an issue',
];

const shuffleArray = input => {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const CameraScreen = props => {
  const { reportId } = props;
  const navigation = useNavigation();
  const route = useRoute();
  const isReviewMode = useMemo(() => {
    return reportId !== undefined;
  }, [reportId]);

  const appState = useRef(AppState.currentState);
  const camera = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isCameraFocused, setIsCameraFocused] = useState(true);
  const [phototaken, setPhototaken] = useState(false);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [photoData, setPhotoData] = useState(null);
  const [isInAnnotationMode, setIsInAnnotationMode] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [hasPhotoLibraryPermission, setHasPhotoLibraryPermission] =
    useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const shuffledPrompts = useMemo(
    () => shuffleArray(CLEANAPP_PROMPTS),
    [],
  );
  // promptOpacity removed as it is handled in StoryCrosshair now (or simpler rotation)
  const tapAnimatedValue = useRef(new Animated.Value(0.2));
  const tapScale = useState(0);
  const { t } = useTranslation();
  const { hasPermission, requestPermission } = useCameraPermission();

  const isFocused = useIsFocused();

  useEffect(() => {
    setTimeout(async () => {
      await getLocation();
    }, 1500);
  }, []);

  useEffect(() => {
    setIsCameraFocused(isFocused);
  }, [isFocused]);

  // Rotate prompts once per dial rotation so labels melt together before switching
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex(prev => (prev + 1) % shuffledPrompts.length);
    }, ROTATION_DURATION_MS);
    return () => clearInterval(interval);
  }, [shuffledPrompts.length]);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        appState.current = nextAppState;
        setIsCameraActive(appState.current === 'active');
      },
    );
    return () => {
      appStateSubscription.remove();
    };
  }, []);

  // ... (rest of standard hooks)

  tapAnimatedValue.current.addListener(state => {
    tapScale[1](state.value);
  });

  const device = useCameraDevice('back');
  const frontDevice = useCameraDevice('front');

  // Fallback logic for Android 9 devices where back camera might be undefined
  const backDevice = React.useMemo(() => {
    if (device) {
      return device;
    }

    // If back device is not available, try to get any available device
    if (Platform.OS === 'android') {
      // For Android, we can try to get the first available device
      // This is a workaround for Android 9 devices where useCameraDevice('back') might fail
      if (frontDevice) {
        return frontDevice;
      }

      return null;
    }

    return null;
  }, [device, frontDevice]);

  // Enhanced camera availability check
  const isCameraAvailable = React.useMemo(() => {
    const available =
      hasPermission &&
      !!backDevice &&
      isCameraActive &&
      isCameraFocused &&
      !isInAnnotationMode;
    return available;
  }, [
    hasPermission,
    backDevice,
    isCameraActive,
    isCameraFocused,
    isInAnnotationMode,
  ]);

  const minCameraZoom = backDevice ? backDevice.minZoom : 1.0;
  const maxCameraZoom = backDevice
    ? backDevice.maxZoom
    : Platform.OS === 'ios'
      ? 123
      : 6;

  const minZoom = 1.0;
  const maxZoom = Platform.OS === 'ios' ? 50.0 : 5.0;
  const zoom = useSharedValue(backDevice ? backDevice.neutralZoom : minZoom);
  const zoomOffset = useSharedValue(minZoom);
  const currZoomOffset = useSharedValue(minZoom);

  useEffect(() => {
    if (phototaken) {
      // The ShutterFlash component handles its own animations now
      // Reset the state after the 1 second effect completes
      setTimeout(() => {
        setPhototaken(false);
      }, 1000);
    }
  }, [phototaken]);

  useEffect(() => {
    requestPermission();
  }, []);

  // Listen for tab button actions
  useEffect(() => {
    if (route.params?.takePhoto) {
      takePhoto(false);
    }
  }, [route.params?.takePhoto]);

  useEffect(() => {
    if (route.params?.takePhotoWithAnnotation) {
      takePhoto(true);
    }
  }, [route.params?.takePhotoWithAnnotation]);

  const checkPhotoLibraryPermission = async () => {
    try {
      let permission;
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      } else {
        if (Platform.Version >= 33) {
          permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
        } else {
          permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        }
      }

      const result = await check(permission);
      switch (result) {
        case RESULTS.UNAVAILABLE:
          setHasPhotoLibraryPermission(false);
          return false;
        case RESULTS.DENIED:
          const permissionResult = await request(permission);
          setHasPhotoLibraryPermission(permissionResult === RESULTS.GRANTED);
          return permissionResult === RESULTS.GRANTED;
        case RESULTS.LIMITED:
          setHasPhotoLibraryPermission(true);
          return true;
        case RESULTS.GRANTED:
          setHasPhotoLibraryPermission(true);
          return true;
        case RESULTS.BLOCKED:
          Alert.alert(
            t('camerascreen.notice'),
            t('camerascreen.photolibraryaccesspermissionnotgranted'),
            [
              { text: t('camerascreen.no'), style: 'cancel' },
              {
                text: t('camerascreen.yes'),
                onPress: () => Linking.openSettings(),
              },
            ],
            { cancelable: false },
          );
          setHasPhotoLibraryPermission(false);
          return false;
      }
    } catch (error) {
      setHasPhotoLibraryPermission(false);
      return false;
    }
  };

  const takePhotoOptions = useMemo(() => ({
    photoCodec: 'jpeg',
    enableAutoStabilization: true,
    qualityPrioritization: 'balanced',
    skipMetadata: true,
  }));

  const uploadPhoto = async (file, annotation = '') => {
    const userLocation = await getLocation();
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      if (userLocation.longitude === 0 && userLocation.latitude === 0) {
        Alert.alert(
          t('camerascreen.notice'),
          t('camerascreen.invalidlocation'),
          [{ text: t('camerascreen.ok'), onPress: () => { } }],
          { cancelable: false },
        );
        return null;
      }

      var path = file.uri;
      const imageData = await RNFS.readFile(path, 'base64');
      const walletAddress = await getWalletAddress();
      let res = null;

      if (isReviewMode) {
        res = await matchReports(
          walletAddress,
          userLocation.latitude,
          userLocation.longitude,
          imageData,
        );

        showMatchReportsResult(res);
      } else {
        res = await report(
          walletAddress,
          userLocation.latitude,
          userLocation.longitude,
          /*tapX=*/ 0.5,
          /*tapY=*/ 0.5,
          imageData,
          annotation,
        );
      }

      // Clean up the image file after upload
      await cleanupImageFile(path);

      return res;
    } else {
      Alert.alert(
        t('camerascreen.notice'),
        t('camerascreen.invalidlocation'),
        [{ text: t('camerascreen.ok'), onPress: () => { } }],
        { cancelable: false },
      );
      return null;
    }
  };

  const showMatchReportsResult = res => {
    const resolvedMessage =
      '+2 KITN for verification';
    const reportMessage =
      '+1 KITN for reporting';
    try {
      if (res.success && res.success === true) {
        if (res.results.length > 0) {
          const isResolved = res.results.find(
            result => result.resolved === true,
          );

          ToastService.show({
            text1: isResolved ? 'Congratulations!' : 'Great job!',
            text2: isResolved ? resolvedMessage : reportMessage,
            type: 'success',
            position: 'center',
            duration: 5000,
            useModal: false,
          });
        } else {
          console.log('No reports matched');
        }
      } else {
        // Show error toast if report submission failed at top
        console.log('Report Submission Failed');
        ToastService.error(reportMessage, 'top', 4000);
      }

      console.log('res', res);
    } catch (error) {
      console.log('error', error);
      // Show error toast for exceptions at top
      ToastService.error(
        'Something went wrong! Please try again.',
        'top',
        4000,
      );
    }
  };

  const takePhoto = async (withAnnotation = false) => {
    let originalPhotoPath = null;
    let resizedPhotoPath = null;

    try {
      if (!camera || !camera.current) {
        // Gracefully handle null camera (e.g., iOS simulator)
        setPhototaken(true);
        return;
      }

      if (!backDevice) {
        Alert.alert(
          t('camerascreen.notice'),
          'Camera not available',
          [{ text: t('camerascreen.ok'), onPress: () => { } }],
          { cancelable: false },
        );
        return;
      }

      const photo = await camera.current.takePhoto(takePhotoOptions);

      // Resize the photo to height 1000 while preserving aspect ratio
      const originalUri =
        Platform.OS === 'ios'
          ? photo.path.replace('file://', '')
          : 'file://' + photo.path;
      originalPhotoPath = originalUri;
      const resizedUri = await resizePhoto(originalUri);
      resizedPhotoPath = resizedUri;

      const photoFile = {
        uri: resizedUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      };

      if (withAnnotation) {
        setPhotoData(photoFile);
        setShowAnnotationModal(true);
        setIsInAnnotationMode(true);
      } else {
        setPhototaken(true);
        const res = await uploadPhoto(photoFile).catch(err => {
          Alert.alert(
            t('camerascreen.notice'),
            t('camerascreen.failedtosaveimage') + err.message,
            [{ text: t('camerascreen.ok'), onPress: () => { } }],
            { cancelable: false },
          );
        });
        if (!res.ok) {
          Alert.alert(
            t('camerascreen.notice'),
            t('camerascreen.failedtosaveimage') + res.error,
            [{ text: t('camerascreen.ok'), onPress: () => { } }],
            { cancelable: false },
          );
          return;
        }
      }
    } catch (e) {
      // Only show error for actual camera errors, not for simulator
      if (camera && camera.current) {
        Alert.alert(
          t('camerascreen.notice'),
          t('camerascreen.failedtotakephoto') + e.message,
          [{ text: t('camerascreen.ok'), onPress: () => { } }],
          { cancelable: false },
        );
      }
    } finally {
      // Clean up original photo file if it exists and is different from resized
      if (originalPhotoPath && originalPhotoPath !== resizedPhotoPath) {
        await cleanupImageFile(originalPhotoPath);
      }

      // navigate to report details screen if isReviewMode is true
      if (isReviewMode) {
        navigation.goBack();
      }
    }
  };

  const submitAnnotation = async () => {
    if (!photoData) return;

    setShowAnnotationModal(false);
    setPhototaken(true);
    try {
      const res = await uploadPhoto(photoData, annotationText).catch(err => {
        Alert.alert(
          t('camerascreen.notice'),
          t('camerascreen.failedtosaveimage') + err.message,
          [{ text: t('camerascreen.ok'), onPress: () => { } }],
          { cancelable: false },
        );
      });

      if (!res || !res.ok) {
        Alert.alert(
          t('camerascreen.notice'),
          t('camerascreen.failedtosaveimage') + (res?.error || 'Unknown error'),
          [{ text: t('camerascreen.ok'), onPress: () => { } }],
          { cancelable: false },
        );
        return;
      }

      setAnnotationText('');
      setPhotoData(null);
      setIsInAnnotationMode(false);
    } catch (e) {
      Alert.alert(
        t('camerascreen.notice'),
        t('camerascreen.failedtosaveimage') + e.message,
        [{ text: t('camerascreen.ok'), onPress: () => { } }],
        { cancelable: false },
      );
    }
  };

  const cancelAnnotation = async () => {
    // Clean up the photo file if it exists
    if (photoData && photoData.uri) {
      await cleanupImageFile(photoData.uri);
    }

    setShowAnnotationModal(false);
    setAnnotationText('');
    setPhotoData(null);
    setIsInAnnotationMode(false);
  };

  const handleOverlayPress = () => {
    if (isKeyboardVisible) {
      // If keyboard is visible, just dismiss it
      Keyboard.dismiss();
    } else {
      // If keyboard is not visible, cancel the annotation
      cancelAnnotation();
    }
  };

  const selectPhotoFromGallery = async () => {
    let originalPhotoPath = null;
    let resizedPhotoPath = null;

    try {
      // Check photo library permission first
      if (!hasPhotoLibraryPermission) {
        const hasPermission = await checkPhotoLibraryPermission();
        if (!hasPermission) {
          return;
        }
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          t('camerascreen.notice'),
          'Failed to select photo: ' + result.errorMessage,
          [{ text: t('camerascreen.ok'), onPress: () => { } }],
          { cancelable: false },
        );
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const selectedPhoto = result.assets[0];
        originalPhotoPath = selectedPhoto.uri;

        // Resize the selected photo to height 1000 while preserving aspect ratio
        const resizedUri = await resizePhoto(selectedPhoto.uri);
        resizedPhotoPath = resizedUri;

        const photoFile = {
          uri: resizedUri,
          type: selectedPhoto.type || 'image/jpeg',
          name: selectedPhoto.fileName || 'photo.jpg',
        };

        setPhotoData(photoFile);
        setShowAnnotationModal(true);
        setIsInAnnotationMode(true);
      }
    } catch (error) {
      Alert.alert(
        t('camerascreen.notice'),
        'Failed to open gallery: ' + error.message,
        [{ text: t('camerascreen.ok'), onPress: () => { } }],
        { cancelable: false },
      );
    } finally {
      // Clean up original photo file if it exists and is different from resized
      if (originalPhotoPath && originalPhotoPath !== resizedPhotoPath) {
        await cleanupImageFile(originalPhotoPath);
      }
    }
  };

  const pinchGestureInit = Gesture.Pinch();
  const pinchGesture = pinchGestureInit
    .onUpdate(event => {
      currZoomOffset.value = Math.min(
        maxZoom,
        Math.max(minZoom, zoomOffset.value * event.scale),
      );
      zoom.value = interpolate(
        currZoomOffset.value,
        [minZoom, maxZoom],
        [minCameraZoom, maxCameraZoom],
        Extrapolation.CLAMP,
      );
    })
    .onEnd(() => {
      zoomOffset.value = currZoomOffset.value;
    });

  const allGestures = Gesture.Race(pinchGesture);

  const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

  // Function to resize photo to height 1000 while preserving aspect ratio
  const resizePhoto = async photoUri => {
    try {
      // First, get the image dimensions to calculate the proper width
      const imageInfo = await ImageResizer.createResizedImage(
        photoUri,
        1000, // maxWidth - we'll calculate this properly
        1000, // maxHeight - this is our target height
        'JPEG',
        80, // quality
        0, // rotation
        undefined, // outputPath
        false, // keepMetadata
        { mode: 'contain', onlyScaleDown: false },
      );

      // The resized image will maintain aspect ratio with height 1000
      return imageInfo.uri;
    } catch (error) {
      // Return original URI if resizing fails
      return photoUri;
    }
  };

  // Function to clean up image files
  const cleanupImageFile = async filePath => {
    try {
      await RNFS.unlink(filePath);
    } catch (cleanupError) {
      console.log('Failed to clean up image file:', cleanupError);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <GestureHandlerRootView>
        <GestureDetector gesture={allGestures}>
          <View style={styles.container}>
            {isCameraAvailable && (
              <ReanimatedCamera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={backDevice}
                isActive={isCameraActive}
                photo={true}
                torch={'off'}
                animatedProps={animatedProps}
                enableZoomGesture={true}
                enableFpsGraph={false}
                enableHighQualityPhotos={true}
                onError={error => {
                  console.error('Camera error:', error);
                  Alert.alert(
                    t('camerascreen.notice'),
                    'Camera configuration error: ' + error.message,
                    [{ text: t('camerascreen.ok'), onPress: () => { } }],
                    { cancelable: false },
                  );
                }}
              />
            )}
            {isInAnnotationMode && photoData && (
              <Image
                source={{ uri: photoData.uri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            )}
            <View style={styles.gradientContainer} pointerEvents="box-none">
              {/* Premium shutter flash effect */}
              <ShutterFlash isActive={phototaken} />

              {/* Story Crosshair - Replaces TargetIcon and Prompt Carousel */}
              {!phototaken && !isInAnnotationMode && (
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: -130, // Higher to use top space
                  }}
                  pointerEvents="box-none"
                >
                  <StoryCrosshair
                    currentPrompt={shuffledPrompts[currentPromptIndex]}
                    isActive={isFocused}
                    rotationKey={currentPromptIndex}
                  />
                </View>
              )}

              {phototaken && (
                <RewardCircle t={t} />
              )}
            </View>

            {!phototaken && !isInAnnotationMode && (
              <>
                {/* Upload Button */}
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={selectPhotoFromGallery}>
                  <Text style={styles.uploadButtonText}>
                    {t('camerascreen.upload') || 'Upload'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </GestureDetector>
      </GestureHandlerRootView>

      {/* Annotation Modal */}
      <Modal
        visible={showAnnotationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleOverlayPress}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleOverlayPress}>
          {/* Annotation Input */}
          {/* <TouchableOpacity
            style={styles.annotationInputContainer}
            activeOpacity={1}
            onPress={() => {
              if (isKeyboardVisible) {
                Keyboard.dismiss();
              }
            }}
          > */}
          <Text style={styles.annotationTitle}>
            {t('camerascreen.addannotation') || 'Add Annotation'}
          </Text>
          <TextInput
            style={styles.annotationInput}
            placeholder={
              t('camerascreen.annotationplaceholder') ||
              'Enter your annotation...'
            }
            placeholderTextColor={theme.COLORS.TEXT_GREY}
            value={annotationText}
            onChangeText={setAnnotationText}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
          {/* </TouchableOpacity> */}

          {/* Buttons Container */}
          <View style={styles.buttonsContainer}>
            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButtonContainer}
              onPress={submitAnnotation}>
              <Text style={styles.submitButtonText}>
                {t('camerascreen.submit') || 'Submit'}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButtonContainer}
              onPress={cancelAnnotation}>
              <Text style={styles.cancelButtonText}>
                {t('camerascreen.cancel') || 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    position: 'absolute',
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientFrame: {
    width: 200,
    height: 200,
  },
  tapSpotContainer: {
    position: 'absolute',
    width: tapSpotDiameter,
    height: tapSpotDiameter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  target: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurview: {
    borderRadius: 20,
    backgroundColor: theme.COLORS.WHITE_OPACITY_1P,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurview2: {
    borderRadius: 20,
    backgroundColor: theme.COLORS.WHITE_OPACITY_10P,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topText: {
    fontFamily: fontFamilies.Default,
    color: theme.COLORS.TEXT_GREY,
    position: 'absolute',
    top: 30,
  },
  bottomText: {
    marginTop: 34,
    fontSize: 16,
    fontFamily: fontFamilies.Default,
    color: theme.COLORS.TEXT_GREY,
  },
  centerText: {
    margin: 20,
    fontSize: 16,
    fontFamily: fontFamilies.Default,
    color: theme.COLORS.TEXT_GREY,
    textAlign: 'center',
  },
  subPromptText: {
    fontSize: 13,
    fontFamily: fontFamilies.Default,
    color: theme.COLORS.TEXT_GREY,
    opacity: 0.7,
  },
  flashOverlay: {
    flex: 1,
    backgroundColor: '#00FF0080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  annotationInputContainer: {
    backgroundColor: theme.COLORS.PANEL_BG,
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.COLORS.BORDER,
  },
  annotationTitle: {
    fontSize: 18,
    fontFamily: fontFamilies.Default,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme.COLORS.TEXT_GREY,
    textAlign: 'center',
  },
  annotationInput: {
    width: '100%',
    height: 100,
    borderColor: theme.COLORS.BORDER,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
  },
  buttonsContainer: {
    flexDirection: 'column',
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
    gap: 15,
  },
  submitButtonContainer: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: theme.COLORS.TEXT_WHITE,
    fontWeight: 'bold',
    fontFamily: fontFamilies.Default,
    fontSize: 16,
  },
  cancelButtonContainer: {
    backgroundColor: theme.COLORS.BTN_BG_RED,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.COLORS.TEXT_WHITE,
    fontWeight: 'bold',
    fontFamily: fontFamilies.Default,
    fontSize: 16,
  },
  uploadButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 70,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: CLEANAPP_DARK_GREEN,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  uploadButtonText: {
    color: theme.COLORS.TEXT_WHITE,
    fontWeight: 'bold',
    fontFamily: fontFamilies.Default,
    fontSize: 15,
  },
  storyLabelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurviewStory: {
    borderRadius: 18,
    backgroundColor: 'rgba(10, 12, 14, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  topStoryPill: {
    maxWidth: 220,
    paddingHorizontal: 16,
  },
  normalPillDim: {
    backgroundColor: 'rgba(10, 12, 14, 0.72)',
  },
  motifGreenPill: {
    backgroundColor: CLEANAPP_DARK_GREEN,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  storyText: {
    fontFamily: fontFamilies.Default,
    color: theme.COLORS.TEXT_WHITE,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});

export default CameraScreen;
