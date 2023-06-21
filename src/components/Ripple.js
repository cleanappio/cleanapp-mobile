import React from 'react';
import {
  View,
  Platform,
  TouchableNativeFeedback,
  TouchableHighlight,
} from 'react-native';

const Ripple = ({
  style = {},
  containerStyle = {},
  children = null,
  ...props
}) => {
  const makeTouchable = (TouchableComponent) => {
    const Touchable =
      TouchableComponent ||
      Platform.select({
        android: TouchableNativeFeedback,
        ios: TouchableHighlight,
        default: TouchableHighlight,
      });
    let defaultTouchableProps = {};
    if (Touchable === TouchableHighlight) {
      defaultTouchableProps = {underlayColor: 'rgba(0, 0, 0, 0.1)'};
    }
    return {Touchable, defaultTouchableProps};
  };

  const {Touchable, defaultTouchableProps} = makeTouchable();

  const outerStyle = {
    borderRadius: style.borderRadius ? style.borderRadius : 0,
    overflow: 'hidden',
    ...containerStyle,
  };

  return (
    <View style={outerStyle}>
      <Touchable {...defaultTouchableProps} {...props}>
        <View style={style}>{children}</View>
      </Touchable>
    </View>
  );
};

export default Ripple;
