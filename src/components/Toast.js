import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';

const Toast = ({message, visible, onHide, duration = 3000}) => {
  // Debug logging

  // Track prop changes
  const prevProps = useRef({message, visible, duration});
  useEffect(() => {
    if (
      prevProps.current.message !== message ||
      prevProps.current.visible !== visible
    ) {
      prevProps.current = {message, visible, duration};
    }
  }, [message, visible, duration]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Slide in and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {});

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [visible, duration]);

  const hideToast = () => {
    // Slide out and fade out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <View style={styles.toast}>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.dismissText} onPress={hideToast}>
          ✕
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toast: {
    backgroundColor: theme.COLORS.BLACK,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    color: theme.COLORS.WHITE,
    fontSize: 14,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    flex: 1,
  },
  dismissText: {
    color: theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

// Global toast state
let globalToastState = {
  visible: false,
  message: '',
  duration: 3000,
  onHide: () => {},
};

// Global toast component
const GlobalToast = () => {
  const [toastState, setToastState] = useState(globalToastState);

  useEffect(() => {
    const updateToast = () => {
      setToastState({...globalToastState});
    };

    // Listen for global state changes
    const interval = setInterval(updateToast, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <Toast
      message={toastState.message}
      visible={toastState.visible}
      onHide={toastState.onHide}
      duration={toastState.duration}
    />
  );
};

// Static show method
Toast.show = options => {
  const {text1, message, duration = 3000, onHide = () => {}} = options;

  // Combine text1 and text2 if both provided, otherwise use message
  const toastMessage = text1 ? `${text1}` : message || text1 || '';

  globalToastState = {
    visible: true,
    message: toastMessage,
    duration,
    onHide: () => {
      globalToastState.visible = false;
      onHide();
    },
  };
};

// Hide method
Toast.hide = () => {
  globalToastState.visible = false;
};

export default Toast;
export {GlobalToast};
