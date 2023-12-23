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
  Pressable,
} from 'react-native';
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
import { getReverseGeocodingData } from '../services/API/MapboxAPI';
import { getWalletAddress } from '../services/DataManager';

const tapSpotDiameter = 400;
const tapDuration = 2000;

const CameraScreen = (props) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [useFront, setUseFront] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [frameWidth, setFrameWidth] = useState(1280);
  const [frameHeight, setFrameHeight] = useState(720);
  const [regionEnabled, setRegionEnabled] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const camera = useRef(null);
  const [photoPath, setPhotoPath] = useState('');
  const [{ cameraAction }, dispatch] = useStateValue();
  const [phototaken, setPhototaken] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const tapAnimatedValue = useRef(new Animated.Value(0)).current;
  const [tapScale, setTapScale] = useState(0);
  const [flashVisible, setFlashVisible] = useState(false);
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
  const frontCam = devices.front;
  const backCam = devices.back;
  const device = backCam;

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
    let selectedCam;
    if (useFront) {
      selectedCam = frontCam;
    } else {
      selectedCam = backCam;
    }
    if (selectedCam) {
      for (let index = 0; index < selectedCam.formats.length; index++) {
        const format = selectedCam.formats[index];
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
    if (cameraAction && cameraAction.requestCameraShot) {
      takePhoto().then(() => {
        setPhototaken(true);
      });
    } else {
      setPhototaken(false);
    }
  }, [cameraAction]);

  useEffect(() => {
    if (tappingOn) {
      Animated.timing(tapAnimatedValue, {
        toValue: 1,
        duration: tapDuration,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(tapAnimatedValue, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
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
        dispatch({
          type: actions.SET_CAMERA_ACTION,
          cameraAction: { requestCameraShot: false },
        });
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
          'Notice',
          'User Location is invalid. Will you go to Settings and check for Location Setting?',
        );
        return null;
      }
      let locationStr = '';
      let cityStr = '';
      const locStr = await getReverseGeocodingData(
        [userLocation.longitude, userLocation.latitude],
        true,
      );
      if (locStr && locStr.features) {
        const features = locStr.features;
        if (features.length > 0) {
          locationStr = features[0].context.find((context) =>
            context?.id?.startsWith('locality.'),
          )?.text;
          cityStr = features[0].context.find((context) =>
            context?.id?.startsWith('place.'),
          )?.text;
        }
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
    }
    return null;
  };

  const takePhoto = async () => {
    if (camera.current) {
      try {
        if (camera.current === null) throw new Error('Camera is null!');
        const photo = await camera.current.takePhoto(takePhotoOptions);
        setFlashVisible(true);
        setTimeout(() => {
          setFlashVisible(false);
        }, 500);

        uploadPhoto({
          uri:
            Platform.OS === 'ios'
              ? photo.path.replace('file://', '')
              : 'file://' + photo.path,
          type: 'image/jpeg',
          name: 'photo.jpg',
        })
          .then((data) => {
            if (data) {
              setFlashVisible(true);
              setTimeout(() => {
                setFlashVisible(false);
              }, 500);
            }
          })
          .catch((err) => {
            Alert.alert(
              t('camerascreen.saveimage'),
              t('camerascreen.failedtosaveimage') + err.message,
              [{ text: t('camerascreen.ok'), onPress: () => { } }],
              { cancelable: false },
            );
          });
      } catch (e) {
        // error occured while saving photo
      }
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
      outputRange: [-200, Platform.OS === 'ios' ? 0 : 0],
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

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.container}
        onLayout={({ nativeEvent }) => {
          setCameraLayout(nativeEvent.layout);
        }}
      >
        {hasPermission && (useFront ? !!frontCam : !!backCam) && (
          <Camera
            ref={camera}
            hdr={true}
            enableZoomGesture={true}
            style={StyleSheet.absoluteFill}
            device={useFront ? frontCam : backCam}
            isActive={isActive}
            format={format}
            photo={true}
            torch={torchEnabled ? 'on' : 'off'}
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
        {tappingOn && <Animated.View
          style={
            {
              position: 'absolute',
              top: tapY - tapSpotDiameter / 2 * tapScale,
              left: tapX - tapSpotDiameter / 2 * tapScale,
              width: tapSpotDiameter * tapScale,
              height: tapSpotDiameter * tapScale,
            }
          }
        >
          <RadialGradient
            style={{
              width: "100%",
              height: "100%",
            }}
            colors={theme.COLORS.CAMERA_TAP_SPOT_GRADIENT}
            radius={tapSpotDiameter / 2 * tapScale}
          />
        </Animated.View>}
        <Pressable
          style={
            {
              position: 'absolute',
              width: Dimensions.get('screen').width,
              height: Dimensions.get('screen').height,
            }
          }
          delayLongPress={tapDuration}
          onLongPress={() => {
            setTappingOn(false);
            takePhoto().then(() => {
              setPhototaken(true);
            });
          }}
          onPressIn={({ nativeEvent }) => {
            if (phototaken) {
              return;
            }
            setTappingOn(true);
            setTapX(nativeEvent.locationX);
            setTapY(nativeEvent.locationY);
          }}
          onPressOut={() => setTappingOn(false)}
        />
      </View>
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
