import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {theme} from '../services/Common/theme';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import Reanimated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import ShutterIcon from '../components/ShutterIcon';
import {fontFamilies} from '../utils/fontFamilies';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import ChevronLeft from '../components/ChevronLeft';

type ReportsStackParamList = {
  ReportsScreen: undefined;
  ReportDetails: {report: any};
  ReviewCameraScreen: {report: any};
};

type ReviewCameraScreenNavigationProp = StackNavigationProp<
  ReportsStackParamList,
  'ReportDetails' | 'ReviewCameraScreen'
>;

Reanimated.addWhitelistedNativeProps({
  zoom: true,
});
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);

const ReviewCameraScreen = ({route}: {route: {params: {report: any}}}) => {
  const {report} = route.params;
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const frontDevice = useCameraDevice('front');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [isCameraFocused, setIsCameraFocused] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isInAnnotationMode, setIsInAnnotationMode] = useState(false);
  const camera = useRef(null);

  const navigation = useNavigation<ReviewCameraScreenNavigationProp>();

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    setIsCameraFocused(isFocused);
  }, [isFocused]);

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

  const animatedProps = useAnimatedProps(() => ({zoom: zoom.value}), [zoom]);

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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {isCameraAvailable && backDevice && (
          <GestureHandlerRootView>
            <GestureDetector gesture={allGestures}>
              <ReanimatedCamera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={backDevice}
                isActive={isCameraActive}
                photo={true}
                torch={'off'}
                animatedProps={animatedProps}
              />
            </GestureDetector>
          </GestureHandlerRootView>
        )}

        <View style={styles.shutterIconContainer}>
          <View style={styles.shutterIconWrapper}>
            <ShutterIcon />
          </View>
        </View>

        <View style={styles.closeButtonContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.closeButtonText}>
              <ChevronLeft color={theme.COLORS.WHITE} />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.BG,
  },
  shutterIconContainer: {
    position: 'absolute',
    bottom: 24,
    right: 0,
    left: 0,
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterIconWrapper: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 24,
    left: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.BLACK_OPACITY_49P,
    borderRadius: 40,
  },
  closeButtonText: {
    fontSize: 14,
    fontFamily: fontFamilies.Default,
    color: theme.COLORS.WHITE,
  },
});

export default ReviewCameraScreen;
