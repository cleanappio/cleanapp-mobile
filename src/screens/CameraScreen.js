/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  AppState,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
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
import { useIsFocused } from '@react-navigation/native';

import { theme } from '../services/Common/theme';
import { fontFamilies } from '../utils/fontFamilies';
import CheckBigIcon from '../assets/ico_check_big.svg';
import CameraShootIcon from '../assets/ico_camera_shoot.svg';
import TargetIcon from '../assets/ico_target.svg';
import { BlurView } from '@react-native-community/blur';
import { useTranslation } from 'react-i18next';
import { report } from '../services/API/APIManager';
import { getLocation } from '../functions/geolocation';
import { getWalletAddress } from '../services/DataManager';

import Svg, {
  Ellipse,
  Defs,
  RadialGradient as SvgRadialGradient,
  Stop,
} from 'react-native-svg';

const tapSpotDiameter = 450;

Reanimated.addWhitelistedNativeProps({
  zoom: true,
})
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);

const GreenFlash = ({
  flashDiameterX,
  flashDiameterY,
  x,
  y,
  scaleX,
  scaleY,
}) => {
  const left = x - flashDiameterX / 2;
  const top = y - flashDiameterY / 2;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: flashDiameterX,
        height: flashDiameterY,
        justifyContent: 'center',
        alignItems: 'center',
        top: top,
        left: left,
      }}
    >
      <Svg
        height={flashDiameterY * scaleY[0]}
        width={flashDiameterX * scaleX[0]}
        viewBox={`0 0 ${flashDiameterX} ${flashDiameterY}`}>
        <Defs>
          <SvgRadialGradient
            id="grad"
            fx={flashDiameterX / 2}
            fy={flashDiameterY / 2}
            rx={flashDiameterX / 2 * scaleX[0]}
            ry={flashDiameterY / 2 * scaleY[0]}
            gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={theme.COLORS.CAMERA_GRADIENT[0]} stopOpacity="1" />
            <Stop offset="1" stopColor={theme.COLORS.CAMERA_GRADIENT[0]} stopOpacity="0" />
          </SvgRadialGradient>
        </Defs>
        <Ellipse
          cx={flashDiameterX / 2}
          cy={flashDiameterY / 2}
          rx={flashDiameterX / 2 * scaleX[0]}
          ry={flashDiameterY / 2 * scaleY[0]}
          fill="url(#grad)"
        />
      </Svg>
    </Animated.View>
  )
}

const CameraScreen = (props) => {
  const appState = useRef(AppState.currentState);
  const camera = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isCameraFocused, setIsCameraFocused] = useState(true);
  const [phototaken, setPhototaken] = useState(false);
  const flashAnimatedValue = useRef(new Animated.Value(0));
  const tapAnimatedValue = useRef(new Animated.Value(0.2));
  const flashScale = useState(0);
  const flashScaleStatic = useState(1);
  const tapScale = useState(0);
  const { t } = useTranslation();
  const { hasPermission, requestPermission } = useCameraPermission();

  const isFocused = useIsFocused();

  useEffect(() => {
    setIsCameraFocused(isFocused);
  }, [isFocused]);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
      setIsCameraActive(appState.current === 'active');
    });
    return () => {
      appStateSubscription.remove();
    }
  }, []);

  tapAnimatedValue.current.addListener((state) => {
    tapScale[1](state.value);
  });

  flashAnimatedValue.current.addListener((state) => {
    flashScale[1](state.value);
  });

  const device = useCameraDevice('back');
  const minCameraZoom = device ? device.minZoom : 1.0;
  const maxCameraZoom = device ? device.maxZoom : (Platform.OS === 'ios' ? 123 : 6);

  const minZoom = 1.0;
  const maxZoom = (Platform.OS === 'ios' ? 50.0 : 5.0);
  const zoom = useSharedValue(device ? device.neutralZoom : minZoom);
  const zoomOffset = useSharedValue(minZoom);
  const currZoomOffset = useSharedValue(minZoom);

  const format = React.useMemo(() => {
    const desiredWidth = 720;
    const desiredHeight = 1280;
    if (device) {
      for (let index = 0; index < device.formats.length; index++) {
        const format = device.formats[index];
        if (
          format.videoWidth === desiredWidth &&
          format.videoHeight === desiredHeight
        ) {
          return format;
        }
      }
    }
    return undefined;
  }, []);

  const cameraShootButtonPosition = React.useMemo(() => {
    const left = Dimensions.get('screen').width / 2 - styles.cameraShootButton.width / 2;
    const bottom = 30;
    const right = left + styles.cameraShootButton.width;
    const top = bottom - styles.cameraShootButton.height;
    return {
      left: left,
      top: top,
      right: right,
      bottom: bottom,
    }
  }, []);

  useEffect(() => {
    if (phototaken) {
      Animated.timing(flashAnimatedValue.current, {
        toValue: 1,
        duration: 50,
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        setPhototaken(false);
      }, 3000);
    } else {
      Animated.timing(flashAnimatedValue.current, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [phototaken, flashAnimatedValue]);

  useEffect(() => {
    requestPermission();
  }, []);

  const takePhotoOptions = useMemo(() => ({
    photoCodec: 'jpeg',
    enableAutoStabilization: true,
    qualityPrioritization: 'balanced',
    skipMetadata: true,
  }));

  const uploadPhoto = async (file) => {
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
      const res = await report(
        walletAddress,
        userLocation.latitude,
        userLocation.longitude,
        /*tapX=*/0.5,
        /*tapY=*/0.5,
        imageData);
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

  const takePhoto = async () => {
    try {
      if (!camera || !camera.current) {
        throw new Error('Camera is null!');
      }
      const photo = await camera.current.takePhoto(takePhotoOptions);
      const res = await uploadPhoto({
        uri:
          Platform.OS === 'ios'
            ? photo.path.replace('file://', '')
            : 'file://' + photo.path,
        type: 'image/jpeg',
        name: 'photo.jpg',
      }).catch((err) => {
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
    } catch (e) {
      Alert.alert(
        t('camerascreen.notice'),
        t('camerascreen.failedtotakephoto') + err.message,
        [{ text: t('camerascreen.ok'), onPress: () => { } }],
        { cancelable: false },
      );
    }
  };

  const pinchGestureInit = Gesture.Pinch();
  const pinchGesture = pinchGestureInit
    .onUpdate((event) => {
      currZoomOffset.value = Math.min(maxZoom, Math.max(minZoom, zoomOffset.value * event.scale));
      zoom.value = interpolate(
        currZoomOffset.value,
        [minZoom, maxZoom],
        [minCameraZoom, maxCameraZoom],
        Extrapolation.CLAMP,
      );
    }).onEnd(() => {
      zoomOffset.value = currZoomOffset.value;
    });

  const allGestures = Gesture.Race(
    pinchGesture,
  );

  const animatedProps = useAnimatedProps(
    () => ({ zoom: zoom.value }),
    [zoom]
  );

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView>
        <GestureDetector gesture={allGestures}>
          <View
            style={styles.container}
          >
            {hasPermission && !!device && isCameraActive && isCameraFocused && (
              <ReanimatedCamera
                ref={camera}
                hdr={true}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isCameraActive}
                format={format}
                photo={true}
                torch={'off'}
                animatedProps={animatedProps}
              />
            )}
            <View style={styles.gradientContainer} pointerEvents="box-none">
              {/* Top */}
              <GreenFlash
                x={Dimensions.get('window').width / 2}
                y={0}
                flashDiameterX={Dimensions.get('window').width}
                flashDiameterY={200}
                scaleX={flashScaleStatic}
                scaleY={flashScale}
              />
              {/* Bottom */}
              <GreenFlash
                x={Dimensions.get('screen').width / 2}
                y={Dimensions.get('screen').height - (Platform.OS === 'ios' ? 150 : 100)}
                flashDiameterX={Dimensions.get('screen').width}
                flashDiameterY={200}
                scaleX={flashScaleStatic}
                scaleY={flashScale}
              />
              {/* Left */}
              <GreenFlash
                x={0}
                y={Dimensions.get('screen').height / 2 - 70}
                flashDiameterX={200}
                flashDiameterY={Dimensions.get('screen').height}
                scaleX={flashScale}
                scaleY={flashScaleStatic}
              />
              {/* Right */}
              <GreenFlash
                x={Dimensions.get('screen').width}
                y={Dimensions.get('screen').height / 2 - 70}
                flashDiameterX={200}
                flashDiameterY={Dimensions.get('screen').height}
                scaleX={flashScale}
                scaleY={flashScaleStatic}
              />
              {!phototaken && hasPermission && (
                <>
                  <View
                    style={
                      {
                        ...styles.blurview2,
                        position: 'absolute',
                        top: 40,
                        left: 40,
                        width: Dimensions.get('screen').width - 80,
                      }
                    }
                  >
                    <Text style={styles.centerText}>
                      {t('camerascreen.prompt')}
                    </Text>
                  </View>
                </>
              )}
              {phototaken && (
                <View style={
                  {
                    ...styles.blurview2,
                    width: 221,
                    height: 191,
                  }
                }>
                  <CheckBigIcon
                    style={{
                      width: 72,
                      height: 72,
                    }}
                    width={72}
                    height={72}
                  />
                  <Text style={styles.bottomText}>
                    {t('camerascreen.newreward')}
                  </Text>
                </View>
              )}
            </View>
            {!phototaken && (
              <>
                <View style={
                  {
                    ...styles.target,
                    left: Dimensions.get('screen').width / 2 - Dimensions.get('screen').width / 1.5 / 2,
                    top: Dimensions.get('screen').height / 2 - Dimensions.get('screen').width / 1.5 / 2 - 50,
                    width: Dimensions.get('screen').width / 1.5,
                    height: Dimensions.get('screen').width / 1.5,
                  }
                }>
                  <TargetIcon />
                </View>
                <Pressable
                  style={{
                    ...styles.cameraShootButton,
                    left: cameraShootButtonPosition.left,
                    bottom: cameraShootButtonPosition.bottom,
                  }}
                  onPress={() => {
                    takePhoto();
                    setPhototaken(true);
                  }}
                >
                  <CameraShootIcon />
                </Pressable>
              </>
            )}
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
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
  cameraShootButton: {
    position: 'absolute',
    width: 70,
    height: 70,
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
  flashOverlay: {
    flex: 1,
    backgroundColor: '#00FF0080',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraScreen;
