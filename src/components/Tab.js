import React, { useEffect, useRef } from 'react';
import { Image, Pressable, StyleSheet, View, Text, Animated } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import ProfileIcon from './ProfileIcon';
import MapIcon from './MapIcon';
import LeaderboardIcon from './LeaderboardIcon';
import ReportIcon from './ReportIcon';
const CleanAppIcon = require('../assets/CleanApp_Logo.png');
import { useStateValue } from '../services/State/State';
import { theme } from '../services/Common/theme';

// Animated central button with pulse animation
const AnimatedCentralButton = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Initial pulse after 1 second
    const initialTimeout = setTimeout(pulseAnimation, 1000);
    // Repeat every 3 seconds
    const interval = setInterval(pulseAnimation, 3000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [scaleAnim]);

  return (
    <Animated.View style={[styles.centralButtonWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.centralButtonContainer}>
        <View style={styles.centralButtonInner}>
          <Image source={CleanAppIcon} style={styles.centralIcon} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  icon: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  // Prominent center button styles
  centralButtonWrapper: {
    width: 90,
    height: 90,
    marginTop: -35,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  centralButtonContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centralButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#C0C0C0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  centralIcon: {
    width: 55,
    height: 55,
  },
  reportsContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 2,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeHidden: {
    backgroundColor: 'transparent',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

function TabComponent({ label, onPress, onLongPress, openedReports = [], ...props }) {
  const [{ reports }] = useStateValue();
  const currentRoute = useNavigationState(state => state.routes[state.index]);
  const isSelected = currentRoute.name === label;

  // Calculate unopened reports count for notification badge
  const unopenedCount = reports.filter(
    report => !openedReports.includes(report.id),
  ).length;

  const renderIcon = () => {
    const iconProps = {
      width: 24,
      height: 24,
      strokeColor: isSelected
        ? theme.COLORS.BTN_BG_BLUE
        : theme.COLORS.TEXT_GREY,
    };

    switch (label) {
      case 'Camera':
        // Prominent center button with gesture handling and bounce animation
        const tapGesture = Gesture.Tap().onEnd(() => {
          runOnJS(onPress)();
        });

        const longPressGesture = Gesture.LongPress()
          .minDuration(500)
          .onStart(() => {
            if (onLongPress) {
              runOnJS(onLongPress)();
            }
          });

        const combinedGesture = Gesture.Race(tapGesture, longPressGesture);

        return (
          <GestureHandlerRootView>
            <GestureDetector gesture={combinedGesture}>
              <AnimatedCentralButton />
            </GestureDetector>
          </GestureHandlerRootView>
        );
      case 'Cache':
        return <ProfileIcon {...iconProps} />;
      case 'Leaderboard':
        return <LeaderboardIcon {...iconProps} />;
      case 'Reports':
        return (
          <View style={styles.reportsContainer}>
            <ReportIcon {...iconProps} />
            <View
              style={[
                styles.notificationBadge,
                unopenedCount === 0 && styles.notificationBadgeHidden,
              ]}>
              {unopenedCount > 0 && (
                <Text style={styles.notificationText}>{unopenedCount}</Text>
              )}
            </View>
          </View>
        );
      case 'Map':
        return <MapIcon {...iconProps} />;
      default:
        return null;
    }
  };

  // For Camera button, gestures are handled inside renderIcon
  if (label === 'Camera') {
    return <View style={[props.style, styles.icon]}>{renderIcon()}</View>;
  }

  return (
    <Pressable onPress={onPress} style={[props.style, styles.icon]}>
      {renderIcon()}
    </Pressable>
  );
}

export default TabComponent;

