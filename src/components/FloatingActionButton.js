import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Platform} from 'react-native';
import {theme} from '../services/Common/theme';

const FloatingActionButton = ({
  onPress,
  icon,
  text,
  position = 'bottom-right',
  size = 'medium',
  color = theme.APP_COLOR_2,
  textColor = theme.COLORS.WHITE,
  style,
  disabled = false,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const getPositionStyles = () => {
    const positions = {
      'bottom-right': {
        bottom: 80,
        right: 20,
      },
      'bottom-left': {
        bottom: 80,
        left: 20,
      },
      'bottom-center': {
        bottom: 80,
        alignSelf: 'center',
      },
      'top-right': {
        top: 60,
        right: 20,
      },
      'top-left': {
        top: 60,
        left: 20,
      },
      'top-center': {
        top: 60,
        alignSelf: 'center',
      },
    };
    return positions[position] || positions['bottom-right'];
  };

  const getSizeStyles = () => {
    const sizes = {
      small: {
        width: 48,
        height: 48,
        borderRadius: 24,
        iconSize: 20,
      },
      medium: {
        width: 56,
        height: 56,
        borderRadius: 28,
        iconSize: 24,
      },
      large: {
        width: 64,
        height: 64,
        borderRadius: 32,
        iconSize: 28,
      },
    };
    return sizes[size] || sizes.medium;
  };

  const sizeStyles = getSizeStyles();
  const positionStyles = getPositionStyles();

  return (
    <View style={[styles.container, positionStyles, style]}>
      <TouchableOpacity
        style={[
          styles.fab,
          {
            width: sizeStyles.width,
            height: sizeStyles.height,
            borderRadius: sizeStyles.borderRadius,
            backgroundColor: disabled ? theme.COLORS.MID_GRAY : color,
          },
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}>
        {icon ? (
          <View
            style={[
              styles.iconContainer,
              {width: sizeStyles.iconSize, height: sizeStyles.iconSize},
            ]}>
            {icon}
          </View>
        ) : (
          <Text
            style={[
              styles.text,
              {color: textColor, fontSize: sizeStyles.iconSize},
            ]}>
            {text || '+'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FloatingActionButton;
