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
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  Linking,
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
import { launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ImageResizer from '@bam.tech/react-native-image-resizer';

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
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [photoData, setPhotoData] = useState(null);
  const [isInAnnotationMode, setIsInAnnotationMode] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [hasPhotoLibraryPermission, setHasPhotoLibraryPermission] = useState(false);
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

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
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
              { text: t('camerascreen.yes'), onPress: () => Linking.openSettings() }
            ],
            { cancelable: false },
          );
          setHasPhotoLibraryPermission(false);
          return false;
      }
    } catch (error) {
      console.log('Error checking photo library permission:', error);
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
      const res = await report(
        walletAddress,
        userLocation.latitude,
        userLocation.longitude,
        /*tapX=*/0.5,
        /*tapY=*/0.5,
        imageData,
        annotation);
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

  const takePhoto = async (withAnnotation = false) => {
    console.log('takePhoto', withAnnotation);
    try {
      if (!camera || !camera.current) {
        // Gracefully handle null camera (e.g., iOS simulator)
        console.log('Camera not available - skipping photo capture');
        setPhototaken(true);
        return;
      }
      const photo = await camera.current.takePhoto(takePhotoOptions);
      
      // Resize the photo to height 1000 while preserving aspect ratio
      const originalUri = Platform.OS === 'ios' ? photo.path.replace('file://', '') : 'file://' + photo.path;
      const resizedUri = await resizePhoto(originalUri);
      
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
        const res = await uploadPhoto(photoFile).catch((err) => {
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
      } else {
        console.log('Camera error in simulator environment:', e.message);
      }
    }
  };

  const submitAnnotation = async () => {
    if (!photoData) return;

    setShowAnnotationModal(false);
    setPhototaken(true);    
    try {
      const res = await uploadPhoto(photoData, annotationText).catch((err) => {
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
    console.log('selectPhotoFromGallery');
    try {
      // Check photo library permission first
      if (!hasPhotoLibraryPermission) {
        console.log('no library access permission');
        const hasPermission = await checkPhotoLibraryPermission();
        if (!hasPermission) {
          console.log('no library access permission 2');
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
        
        // Resize the selected photo to height 1000 while preserving aspect ratio
        const resizedUri = await resizePhoto(selectedPhoto.uri);
        
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

  // Function to resize photo to height 1000 while preserving aspect ratio
  const resizePhoto = async (photoUri) => {
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
        { mode: 'contain', onlyScaleDown: false }
      );
      
      // The resized image will maintain aspect ratio with height 1000
      return imageInfo.uri;
    } catch (error) {
      console.log('Error resizing photo:', error);
      // Return original URI if resizing fails
      return photoUri;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView>
        <GestureDetector gesture={allGestures}>
          <View
            style={styles.container}
          >
            {hasPermission && !!device && isCameraActive && isCameraFocused && !isInAnnotationMode && (
              <ReanimatedCamera
                ref={camera}
                hdr={true}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isCameraActive}
                photo={true}
                torch={'off'}
                animatedProps={animatedProps}
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
              {!phototaken && hasPermission && !isInAnnotationMode && (
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
            {!phototaken && !isInAnnotationMode && (
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
                <GestureDetector
                  gesture={Gesture.Race(
                    Gesture.Tap()
                      .onEnd(() => {
                        runOnJS(takePhoto)(false);
                      }),
                    Gesture.LongPress()
                      .minDuration(500)
                      .onStart(() => {
                        runOnJS(takePhoto)(true);
                      })
                  )}
                >
                  <View
                    style={{
                      ...styles.cameraShootButton,
                      left: cameraShootButtonPosition.left,
                      bottom: cameraShootButtonPosition.bottom,
                    }}
                  >
                    <CameraShootIcon />
                  </View>
                </GestureDetector>
                
                {/* Upload Button */}
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={selectPhotoFromGallery}
                >
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
        onRequestClose={handleOverlayPress}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleOverlayPress}
        >
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
              placeholder={t('camerascreen.annotationplaceholder') || 'Enter your annotation...'}
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
              onPress={submitAnnotation}
            >
              <Text style={styles.submitButtonText}>
                {t('camerascreen.submit') || 'Submit'}
              </Text>
            </TouchableOpacity>
            
            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButtonContainer}
              onPress={cancelAnnotation}
            >
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
    bottom: 30,
    right: 30,
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
  },
  uploadButtonText: {
    color: theme.COLORS.TEXT_WHITE,
    fontWeight: 'bold',
    fontFamily: fontFamilies.Default,
    fontSize: 16,
  },
});

export default CameraScreen;
