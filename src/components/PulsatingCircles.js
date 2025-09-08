import {Animated, View, Text, StyleSheet} from 'react-native';
import {theme} from '../services/Common/theme';
import {useEffect, useState} from 'react';

// Pulsating Animation Component
const PulsatingCircles = () => {
  const [animations] = useState(() => [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  useEffect(() => {
    const createAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const animation1 = createAnimation(animations[0], 0);
    const animation2 = createAnimation(animations[1], 400);
    const animation3 = createAnimation(animations[2], 800);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [animations]);

  return (
    <View style={styles.pulsatingContainer}>
      {animations.map((animValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.pulsatingCircle,
            {
              transform: [
                {
                  scale: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1.5],
                  }),
                },
              ],
              opacity: animValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 0.4, 0],
              }),
            },
          ]}
        />
      ))}
      <View style={styles.centerDot}>
        {/* <Text style={styles.locationEmoji}>📍</Text> */}
      </View>
    </View>
  );
};

export default PulsatingCircles;

const styles = StyleSheet.create({
  pulsatingContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsatingCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: theme.COLORS.BTN_BG_BLUE,
    backgroundColor: 'transparent',
  },
  centerDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  locationEmoji: {
    fontSize: 24,
  },
});
