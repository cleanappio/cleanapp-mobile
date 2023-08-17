
import React, {useRef} from 'react';
import {Image, View, StyleSheet, TouchableHighlight, Dimensions} from 'react-native';
import {theme} from '../services/Common/theme';
const CleanAppIcon = require('../assets/CleanApp_Logo.png');
import {actions} from '../services/State/Reducer';

export const FABCameraButton = ({dispatch = null}) => {
  const onPressCamera = () => {
    dispatch({
      type: actions.SET_CAMERA_ACTION,
      cameraAction: {
        requestCameraShot: true,
      },
    });
  };
  return (
    <View style={styles.cameraWrapper}>
      <TouchableHighlight
        onPress={onPressCamera}
        style={styles.cameraContainer}>
        <View style={styles.fabContainer}>
          <Image
            source={CleanAppIcon}
            resizeMode="cover"
            style={styles.cameraIcon}
          />
        </View>
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  cameraWrapper: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    justifyContent: 'flex-end',
  },
  cameraContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    borderWidth: 2,
    borderColor: theme.APP_COLOR_2,
    borderRadius: 40,
    width: 80,
    height: 80,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 60,
    height: 60,
  },
});
