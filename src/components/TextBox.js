/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {Text, View, Animated, StyleSheet} from 'react-native';
import Ripple from './Ripple';
import PropTypes from 'prop-types';

const TextBox = ({
  title = '',
  value = '',
  icon = null,
  onPress = () => {},
  style = {},
}) => {
  const hasValue = value || value === 0 ? true : false;
  const [animatedValue] = useState(new Animated.Value(hasValue ? 1 : 0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: hasValue ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const labelStyle = {
    position: 'absolute',
    width: '100%',
    left: '4%',
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['-2%', '-12%'],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 10],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#36373a', '#000'],
    }),
  };

  return (
    <Ripple
      onPress={onPress}
      outerStyle={{...styles.containerOuter, ...style}}
      innerStyle={styles.containerInner}>
      <View
        style={{
          alignItems: 'center',
          flex: icon ? 0.85 : 1,
          paddingHorizontal: '5%',
          justifyContent: 'center',
        }}>
        <Animated.Text style={labelStyle}>{title}</Animated.Text>
        <Text
          style={{
            paddingTop: hasValue ? '3%' : 0,
            width: '100%',
            color: '#000',
          }}>
          {value}
        </Text>
      </View>
      {icon ? <View style={{flex: 0.15}}>{icon}</View> : null}
    </Ripple>
  );
};

TextBox.propTypes = {
  icon: PropTypes.node,
  style: PropTypes.object,
  title: PropTypes.string,
  value: PropTypes.object,
  onPress: PropTypes.func,
};

export default TextBox;

const styles = StyleSheet.create({
  containerOuter: {
    elevation: 5,
    shadowRadius: 2,
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: '100%',
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: '#fff',
  },
  containerInner: {
    minHeight: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    paddingBottom: '5%',
    paddingVertical: '2%',
    paddingHorizontal: '5%',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(52,52,52,0.5)',
  },
  shadow: {
    elevation: 10,
  },
  optionsContainer: {
    maxHeight: '50%',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: '3%',
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#0271ff',
    textAlign: 'center',
  },
  optionInner: {
    paddingVertical: '4%',
    paddingHorizontal: '5%',
    backgroundColor: '#f0f0f0',
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e1e1',
  },
  cancelOptionOuter: {
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  cancelOptionText: {
    fontSize: 16,
    color: '#0271ff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
