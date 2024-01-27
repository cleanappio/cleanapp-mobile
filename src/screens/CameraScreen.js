/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler'
import Reanimated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Camera,
  useCameraDevices,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { theme } from '../services/Common/theme';

import { useNavigation } from '@react-navigation/native';
import { useStateValue } from '../services/State/State';
import { actions } from '../services/State/Reducer';
import { openSettings } from 'react-native-permissions';
import RadialGradient from 'react-native-radial-gradient';
import { fontFamilies } from '../utils/fontFamilies';
import CheckBigIcon from '../assets/ico_check_big.svg';
import { BlurView } from '@react-native-community/blur';
import { useTranslation } from 'react-i18next';
import { report } from '../services/API/APIManager';
import { getLocation } from '../functions/geolocation';
import { getWalletAddress } from '../services/DataManager';

import Svg, {
  Circle,
  Defs,
  RadialGradient as SvgRadialGradient,
  Stop,
} from 'react-native-svg';

const tapSpotDiameter = 450;
const tapSpotInitFraction = 0.0;
const tapSpotDelayMillis = 50;
const tapDuration = 1000;

Reanimated.addWhitelistedNativeProps({
  zoom: true,
})
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)

const CameraScreen = (props) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [useFront, setUseFront] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const camera = useRef(null);
  const [{ cameraAction }, dispatch] = useStateValue();
  const [phototaken, setPhototaken] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const tapAnimatedValue = useRef(new Animated.Value(0.2)).current;
  const [tapScale, setTapScale] = useState(0);
  const [tapX, setTapX] = useState(0.0);
  const [tapY, setTapY] = useState(0.0);
  const [tappingOn, setTappingOn] = useState(false);
  const [cameraLayout, setCameraLayout] = useState({});
  const { t } = useTranslation();

  tapAnimatedValue.addListener((state) => {
    setTapScale(state.value)
  });

  const navigation = useNavigation();

  const devices = useCameraDevices();
  const device = devices.back;
  const minZoom = device ? device.minZoom : 1.0;
  const maxZoom = device ? device.maxZoom : (Platform.OS === 'ios' ? 123 : 6);
  const minCameraZoom = 0.0;
  const maxCameraZoom = Platform.OS === 'ios' ? 0.5 : 1.0;
  const zoom = useSharedValue(minCameraZoom);
  const zoomOffset = useSharedValue(minZoom);
  const currZoomOffset = useSharedValue(minZoom);

  const requestPermission = async () => {
    const status = await Camera.requestCameraPermission();
    if (status !== 'authorized') {
      Alert.alert(
        t('camerascreen.alert'),
        t('camerascreen.cameraaccesspermissionnotgranted'),
        [
          {
            text: t('camerascreen.no'),
            onPress: () => { },
            style: 'cancel',
          },
          {
            text: t('camerascreen.yes'),
            onPress: () => {
              openSettings();
            },
          },
        ],
      );
      return;
    }

    setHasPermission(status === 'authorized');
  };

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
  }, [useFront]);

  useEffect(() => {
    if (tappingOn) {
      Animated.timing(tapAnimatedValue, {
        toValue: 1,
        duration: tapDuration - tapSpotDelayMillis,
        delay: tapSpotDelayMillis,  // Used for preventing false spot actlivation
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(tapAnimatedValue, {
        toValue: tapSpotInitFraction,
        duration: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [tappingOn]);

  useEffect(() => {
    if (phototaken) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 50,
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        setPhototaken(false);
      }, 5000);
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [phototaken]);

  useEffect(() => {
    dispatch({
      type: actions.SET_FAB_SHOW,
      fabShow: true,
    });
    requestPermission();

    return () => {
      dispatch({
        type: actions.SET_FAB_SHOW,
        fabShow: false,
      });
    };
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
        tapX / cameraLayout.width,
        tapY / cameraLayout.height,
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

      uploadPhoto({
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
    } catch (e) {
      Alert.alert(
        t('camerascreen.notice'),
        t('camerascreen.failedtotakephoto') + err.message,
        [{ text: t('camerascreen.ok'), onPress: () => { } }],
        { cancelable: false },
      );
    }
  };

  const animateStyleTop = {
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-200, Platform.OS === 'ios' ? -100 : -150],
    }),
  };

  const animateStyleBottom = {
    bottom: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-200, 0],
    }),
  };

  const animateStyleLeft = {
    left: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-200, Platform.OS === 'ios' ? -100 : -150],
    }),
  };

  const animateStyleRight = {
    right: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-200, Platform.OS === 'ios' ? -100 : -150],
    }),
  };

  const longPressGesture = runOnJS(Gesture.LongPress())
    .onBegin((event) => {
      if (phototaken) {
        return;
      }
      setTappingOn(true);
      setTapX(event.x);
      setTapY(event.y);
    }).onStart(() => {
      setTappingOn(false);
      takePhoto().then(() => {
        setPhototaken(true);
      });
    }).onTouchesUp(() => {
      setTappingOn(false);
    }).onTouchesMove(() => {
      setTappingOn(false);
    }).minDuration(tapDuration);

  const pinchGesture = runOnJS(Gesture.Pinch())
    .onStart(() => setTappingOn(false))
    .onUpdate((event) => {
      currZoomOffset.value = Math.min(maxZoom, Math.max(minZoom, zoomOffset.value * event.scale));
      zoom.value = interpolate(
        currZoomOffset.value,
        [minZoom, maxZoom],
        [minCameraZoom, maxCameraZoom],
        Extrapolate.CLAMP,
      );
    }).onEnd(() => {
      zoomOffset.value = currZoomOffset.value;
    });

  const allGestures = Gesture.Race(
    longPressGesture,
    pinchGesture);

  const animatedProps = useAnimatedProps(
    () => ({ zoom: zoom.value }),
    [zoom]
  );

  return (
    <SafeAreaView style={styles.container}>
      <GestureDetector gesture={allGestures}>
        <View
          style={styles.container}
          onLayout={({ nativeEvent }) => {
            setCameraLayout(nativeEvent.layout);
          }}
        >
          {hasPermission && !!device && (
            <ReanimatedCamera
              ref={camera}
              hdr={true}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isActive}
              format={format}
              photo={true}
              torch={torchEnabled ? 'on' : 'off'}
              animatedProps={animatedProps}
            />
          )}
          {/* flashVisible && (
          <View style={styles.flashOverlay}>
            <BlurView style={styles.blurview} blurType="light" blurAmount={6}>
              <CheckBigIcon width={72} height={72} />
              <Text style={styles.bottomText}>
                {t('camerascreen.newreward')}
              </Text>
            </BlurView>
          </View>
        ) */}
          <View style={styles.gradientContainer} pointerEvents="box-none">
            <Animated.View
              style={{
                position: 'absolute',
                ...animateStyleTop,
              }}>
              <RadialGradient
                style={{ ...styles.gradientFrame, transform: [{ scaleX: 4 }] }}
                colors={theme.COLORS.CAMERA_GRADIENT}
                radius={100}
              />
            </Animated.View>
            <Animated.View
              style={{
                position: 'absolute',
                ...animateStyleBottom,
              }}>
              <RadialGradient
                style={{ ...styles.gradientFrame, transform: [{ scaleX: 4 }] }}
                colors={theme.COLORS.CAMERA_GRADIENT}
                radius={100}
              />
            </Animated.View>
            <Animated.View
              style={{
                position: 'absolute',
                ...animateStyleLeft,
              }}>
              <RadialGradient
                style={{ ...styles.gradientFrame, transform: [{ scaleY: 4 }] }}
                colors={theme.COLORS.CAMERA_GRADIENT}
                radius={100}
              />
            </Animated.View>
            <Animated.View
              style={{
                position: 'absolute',
                ...animateStyleRight,
              }}>
              <RadialGradient
                style={{ ...styles.gradientFrame, transform: [{ scaleY: 4 }] }}
                colors={theme.COLORS.CAMERA_GRADIENT}
                radius={100}
              />
            </Animated.View>
            {!phototaken &&
              (Platform.OS === 'ios' ? (
                <BlurView
                  style={
                    {
                      ...styles.blurview,
                      position: 'absolute',
                      top: 40,
                      left: 40,
                      width: Dimensions.get('screen').width - 80,
                    }
                  }
                  blurType="light"
                >
                  <Text style={styles.centerText}>
                    {t('camerascreen.prompt')}
                  </Text>
                </BlurView>
              ) : (
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
              ))
            }
            {phototaken &&
              (Platform.OS === 'ios' ? (
                <BlurView style={
                  {
                    ...styles.blurview,
                    width: 221,
                    height: 191,
                  }
                } blurType="light" blurAmount={6}>
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
                </BlurView>
              ) : (
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
              ))}
          </View>
          {tappingOn &&
            <View style={{
              ...styles.tapSpotContainer,
              top: tapY - tapSpotDiameter / 2,
              left: tapX - tapSpotDiameter / 2,
            }}>
              <Animated.View>
                <Svg
                  height={tapSpotDiameter * tapScale}
                  width={tapSpotDiameter * tapScale}
                  viewBox={`0 0 ${tapSpotDiameter} ${tapSpotDiameter}`}>
                  <Defs>
                    <SvgRadialGradient
                      id="grad"
                      cx={tapSpotDiameter / 2}
                      cy={tapSpotDiameter / 2}
                      fx={tapSpotDiameter / 2}
                      fy={tapSpotDiameter / 2}
                      rx={tapSpotDiameter / 2 * tapScale}
                      ry={tapSpotDiameter / 2 * tapScale}
                      gradientUnits="userSpaceOnUse">
                      <Stop offset="0" stopColor={theme.COLORS.CAMERA_TAP_SPOT_GRADIENT} stopOpacity="1" />
                      <Stop offset="1" stopColor={theme.COLORS.CAMERA_TAP_SPOT_GRADIENT} stopOpacity="0" />
                    </SvgRadialGradient>
                  </Defs>
                  <Circle
                    cx={tapSpotDiameter / 2}
                    cy={tapSpotDiameter / 2}
                    r={tapSpotDiameter / 2 * tapScale}
                    fill="url(#grad)"
                  />
                </Svg>
              </Animated.View>
            </View>
          }
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomView: {
    position: 'absolute',
    bottom: 0,
    height: 80,
    backgroundColor: theme.APP_COLOR_1,
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
