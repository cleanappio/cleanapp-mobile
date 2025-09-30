import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {theme} from '../services/Common/theme';

interface AudioVisualizerProps {
  isActive: boolean;
  isConnected: boolean;
  size?: number;
  barCount?: number;
  color?: string;
  inactiveColor?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  isConnected,
  size = 24,
  barCount = 5,
  color = theme.COLORS.WHITE,
  inactiveColor = theme.COLORS.TEXT_GREY_50P,
}) => {
  const animationRefs = useRef<Animated.Value[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize animation values for each bar
  useEffect(() => {
    animationRefs.current = Array.from(
      {length: barCount},
      () => new Animated.Value(0.1),
    );
  }, [barCount]);

  // Always start animation when component mounts
  useEffect(() => {
    console.log('AudioVisualizer: Component mounted, starting animation');
    startRandomAnimation();
    return stopAnimation;
  }, []);

  // Restart animation when isActive or isConnected changes
  useEffect(() => {
    console.log(
      'AudioVisualizer: State changed - isActive:',
      isActive,
      'isConnected:',
      isConnected,
    );
    startRandomAnimation();
  }, [isActive, isConnected]);

  const startRandomAnimation = () => {
    console.log('AudioVisualizer: Starting random animation');
    // Clear any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animate = () => {
      // Always animate bars with random heights and timings
      animationRefs.current.forEach((animValue, index) => {
        // Create different frequency patterns for each bar (like real audio)
        const frequencyMultiplier = 0.3 + (index / barCount) * 0.7; // 0.3 to 1.0
        const baseHeight = 0.1 + Math.random() * 0.9;
        const randomHeight = Math.min(1.0, baseHeight * frequencyMultiplier);

        // Much faster duration for real-time feel (15-60ms)
        const randomDuration = 15 + Math.random() * 45;

        Animated.timing(animValue, {
          toValue: randomHeight,
          duration: randomDuration,
          useNativeDriver: false,
        }).start();
      });

      // Much faster update cycle (30-120ms) for real-time audio feel
      const nextDelay = 30 + Math.random() * 90;
      animationFrameRef.current = requestAnimationFrame(() => {
        setTimeout(animate, nextDelay);
      });
    };

    // Start the animation
    animate();
  };

  const stopAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const barWidth = Math.max(2, size / barCount - 1);
  const barSpacing = 1;

  if (!isActive || !isConnected) {
    return null;
  }

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      {animationRefs.current.map((animValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              width: barWidth,
              height: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [2, size - 4],
              }),
              backgroundColor: color,
              marginHorizontal: barSpacing / 2,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    borderRadius: 1,
    alignSelf: 'flex-end',
  },
});

export default AudioVisualizer;
