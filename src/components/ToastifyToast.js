import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import ToastManager, {Toast} from 'toastify-react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';

// Custom toast configuration to match our app's design
const toastConfig = {
  success: props => (
    <View style={[styles.toast, styles.successToast]}>
      <View style={styles.contentContainer}>
        <Text style={styles.iconText}>✅</Text>
        <View style={styles.textContainer}>
          <Text style={styles.toastText}>{props.text1}</Text>
          {props.text2 && (
            <Text style={styles.toastSubtext}>{props.text2}</Text>
          )}
        </View>
      </View>
      <Text style={styles.closeButton} onPress={props.hide}>
        ✕
      </Text>
    </View>
  ),
  error: props => (
    <View style={[styles.toast, styles.errorToast]}>
      <View style={styles.contentContainer}>
        <Text style={styles.iconText}>❌</Text>
        <View style={styles.textContainer}>
          <Text style={styles.toastText}>{props.text1}</Text>
          {props.text2 && (
            <Text style={styles.toastSubtext}>{props.text2}</Text>
          )}
        </View>
      </View>
      <Text style={styles.closeButton} onPress={props.hide}>
        ✕
      </Text>
    </View>
  ),
  info: props => (
    <View style={[styles.toast, styles.infoToast]}>
      <View style={styles.contentContainer}>
        <Text style={styles.iconText}>ℹ️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.toastText}>{props.text1}</Text>
          {props.text2 && (
            <Text style={styles.toastSubtext}>{props.text2}</Text>
          )}
        </View>
      </View>
      <Text style={styles.closeButton} onPress={props.hide}>
        ✕
      </Text>
    </View>
  ),
  warning: props => (
    <View style={[styles.toast, styles.warningToast]}>
      <View style={styles.contentContainer}>
        <Text style={styles.iconText}>⚠️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.toastText}>{props.text1}</Text>
          {props.text2 && (
            <Text style={styles.toastSubtext}>{props.text2}</Text>
          )}
        </View>
      </View>
      <Text style={styles.closeButton} onPress={props.hide}>
        ✕
      </Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  toast: {
    width: '90%',
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
    minHeight: 64,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  successToast: {
    backgroundColor: '#4CAF50',
  },
  errorToast: {
    backgroundColor: '#F44336',
  },
  infoToast: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
  },
  warningToast: {
    backgroundColor: '#FF9800',
  },
  toastText: {
    color: theme.COLORS.WHITE,
    fontSize: 18,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
  },
  toastSubtext: {
    color: theme.COLORS.WHITE,
    fontSize: 16,
    fontFamily: fontFamilies.Default,
    marginTop: 4,
    opacity: 0.9,
  },
  closeButton: {
    color: theme.COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

// Export the ToastManager component
export const ToastifyManager = () => (
  <ToastManager
    config={toastConfig}
    theme="dark"
    position="top"
    width="90%"
    minHeight={60}
    visibilityTime={5000}
    autoHide={true}
    useModal={false}
    showCloseIcon={false}
    showProgressBar={true}
    progressBarColor="rgba(255, 255, 255, 1)"
    progressBarHeight={3}
    progressBarBorderRadius={2}
    style={{zIndex: 1}}
  />
);

// Export the Toast object for easy usage
export {Toast};

// Convenience methods that match our current API
export const ToastService = {
  show: options => {
    const {
      text1,
      text2,
      message,
      type = 'info',
      position = 'top',
      duration = 5000,
    } = options;
    const toastMessage = text1 || message || '';
    const toastSubMessage = text2 || '';

    Toast.show({
      ...options,
      type,
      text1: toastMessage,
      text2: toastSubMessage,
      position,
      visibilityTime: duration,
      autoHide: true,
      useModal: false,
      showProgressBar: true,
      progressBarColor: 'rgba(255, 255, 255, 0.3)',
      progressBarHeight: 3,
    });
  },

  success: (message, position = 'top', duration = 5000) => {
    Toast.show({
      type: 'success',
      text1: message,
      position,
      visibilityTime: duration,
      autoHide: true,
      useModal: false,
      showProgressBar: true,
      progressBarColor: 'rgba(255, 255, 255, 0.3)',
      progressBarHeight: 3,
    });
  },

  error: (message, position = 'top', duration = 5000) => {
    Toast.show({
      type: 'error',
      text1: message,
      position,
      visibilityTime: duration,
      autoHide: true,
      useModal: false,
      showProgressBar: true,
      progressBarColor: 'rgba(255, 255, 255, 0.3)',
      progressBarHeight: 3,
    });
  },

  info: (message, position = 'top', duration = 5000) => {
    Toast.show({
      type: 'info',
      text1: message,
      position,
      visibilityTime: duration,
      autoHide: true,
      useModal: false,
      showProgressBar: true,
      progressBarColor: 'rgba(255, 255, 255, 0.3)',
      progressBarHeight: 3,
    });
  },

  warning: (message, position = 'top', duration = 5000) => {
    Toast.show({
      type: 'warning',
      text1: message,
      position,
      visibilityTime: duration,
      autoHide: true,
      useModal: false,
      showProgressBar: true,
      progressBarColor: 'rgba(255, 255, 255, 0.3)',
      progressBarHeight: 3,
    });
  },

  hide: () => {
    Toast.hide();
  },
};

export default ToastifyManager;
