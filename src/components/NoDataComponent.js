/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {View, Text, Animated} from 'react-native';
import AntIcon from 'react-native-vector-icons/AntDesign';

const NoDataComponent = () => {
  useEffect(() => {
    setTimeout(() => {
      springValue.setValue(0.7);
      Animated.spring(springValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }, 1000);
  }, []);

  const [springValue] = useState(new Animated.Value(0));

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Animated.View
        style={{
          borderRadius: 5,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{scale: springValue}],
        }}>
        <AntIcon name="filetext1" size={40} color="#000" />
        <Text>No Data Found</Text>
      </Animated.View>
    </View>
  );
};

export default NoDataComponent;
