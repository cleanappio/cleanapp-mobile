/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useMemo, useRef, useState} from 'react';
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
import {FAB} from 'react-native-paper';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import {theme} from '../services/Common/theme';
import {Row} from '../components/Row';

import {useNavigation} from '@react-navigation/native';
import {useStateValue} from '../services/State/State';
import {actions} from '../services/State/Reducer';
import {
  check,
  PERMISSIONS,
  RESULTS,
  request,
  openSettings,
} from 'react-native-permissions';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import RadialGradient from 'react-native-radial-gradient';
import {fontFamilies} from '../utils/fontFamilies';
import CheckBigIcon from '../assets/ico_check_big.svg';
import {BlurView} from '@react-native-community/blur';
import {ActivityIndicator} from 'react-native';
import {useTranslation} from 'react-i18next';
import {uploadImage} from '../services/API/APIManager';

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
  const [{cameraAction, userLocation}, dispatch] = useStateValue();
  const [phototaken, setPhototaken] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const {t} = useTranslation();

  const navigation = useNavigation();

  const devices = useCameraDevices();
  const frontCam = devices.front;
  const backCam = devices.back;
  const device = backCam;

  useEffect(() => {
    check(PERMISSIONS.IOS.CAMERA)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log('This feature is not available (on this device / in this context)');
            break;
          case RESULTS.DENIED:
            console.log('The permission has not been requested / is denied but requestable');
            requestCameraPermission();
            break;
          case RESULTS.GRANTED:
            console.log('Permission is granted');
            break;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            break;
        }
      })
      .catch((error) => {
        // handle error
      });
  }, []);

  const requestCameraPermission = () => {
    request(PERMISSIONS.IOS.CAMERA).then((result) => {
      // handle result
    });
  };

  
  const requestPermission = async () => {
    const status = await Camera.requestCameraPermission();
    if (status !== 'authorized') {
      Alert.alert(
        t('camerascreen.alert'),
        t('camerascreen.cameraaccesspermissionnotgranted'),
        [
          {
            text: t('camerascreen.no'),
            onPress: () => {},
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
    let retPhoto = RESULTS.GRANTED;
    if (Platform.OS === 'ios') {
      retPhoto = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (retPhoto !== RESULTS.GRANTED) {
        Alert.alert(
          t('camerascreen.alert'),
          t('camerascreen.photolibraryaccesspermissionnotgranted'),
          [
            {
              text: t('camerascreen.no'),
              onPress: () => {},
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
    } else {
      // android Photo Storage Permission enabled by default
    }

    setHasPermission(status === 'authorized' && retPhoto === RESULTS.GRANTED);
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
    if (phototaken) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        dispatch({
          type: actions.SET_CAMERA_ACTION,
          cameraAction: {requestCameraShot: false},
        });
      }, 3000);
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [phototaken]);

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
    const formData = new FormData();
    formData.append('file', file);
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      formData.append('latitude', userLocation.latitude);
      formData.append('longitude', userLocation.longitude);
      formData.append('locality', userLocation.location);
      formData.append('city', userLocation.city);
    }
    const res = await uploadImage(formData);
    if (res) {
    }
  };

  const takePhoto = async () => {
    if (camera.current) {
      try {
        if (camera.current === null) throw new Error('Camera is null!');
        const photo = await camera.current.takePhoto(takePhotoOptions);
        setPhotoPath(photo.path);
        uploadPhoto({
          uri:
            Platform.OS === 'ios'
              ? photo.path.replace('file://', '')
          : 'file://' + photo.path,
          type: 'image/jpeg',
          name: 'photo.jpg',
        })
          .then((data) => {
            setPhotoPath('');
          })
          .catch((err) => {
            Alert.alert(
              t('camerascreen.saveimage'),
              t('camerascreen.failedtosaveimage') + err.message,
              [{text: t('camerascreen.ok'), onPress: () => {}}],
              {cancelable: false},
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
      outputRange: [-200, -100],
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
      outputRange: [-200, -100],
    }),
  };

  const animateStyleRight = {
    right: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-200, -100],
    }),
  };
  if (device == null) {
    //return <ActivityIndicator size={20} color={'red'} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {hasPermission && (
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={useFront ? frontCam : backCam}
            isActive={isActive}
            format={format}
            photo={true}
            torch={torchEnabled ? 'on' : 'off'}
          />
        )}
        <View style={styles.gradientContainer}>
          <Animated.View
            style={{
              position: 'absolute',
              ...animateStyleTop,
            }}>
            <RadialGradient
              style={{...styles.gradientFrame, transform: [{scaleX: 4}]}}
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
              style={{...styles.gradientFrame, transform: [{scaleX: 4}]}}
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
              style={{...styles.gradientFrame, transform: [{scaleY: 4}]}}
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
              style={{...styles.gradientFrame, transform: [{scaleY: 4}]}}
              colors={theme.COLORS.CAMERA_GRADIENT}
              radius={100}
            />
          </Animated.View>
          {phototaken && (
            <Text style={styles.topText}>{t('camerascreen.newreward')}</Text>
          )}
          {phototaken && (
            <BlurView style={styles.blurview} blurType="light" blurAmount={6}>
              <CheckBigIcon width={72} height={72} />
              <Text style={styles.bottomText}>
                {t('camerascreen.photouploaded')}
              </Text>
            </BlurView>
          )}
        </View>
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
    width: 221,
    height: 191,
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
});

export default CameraScreen;
