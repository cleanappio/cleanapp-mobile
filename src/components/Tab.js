/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { theme } from '../services/Common/theme';
import LeaderboardIcon from '../assets/ico_leaderboard.svg';
import MapIcon from '../assets/ico_map.svg';
import ShareIcon from '../assets/ico_share.svg'
import BasketIcon from '../assets/ico_basket.svg';
const CleanAppIcon = require('../assets/CleanApp_Logo.png');

const styles = StyleSheet.create({
  indicatorContainer: {
    marginTop: 7,
    bottom: 0,
    position: 'absolute',
    justifyContent: 'center',
  },
  indicator: {
    height: 4,
    width: 4,
  },
  cameraWrapper: {
    marginTop: -40,
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
  icon: {
    width: 65,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
},
});

const icons = {
  Cache: <BasketIcon />,
  Leaderboard: <LeaderboardIcon />,
  Camera: <Image source={CleanAppIcon} style={styles.icon} />,
  Referral: <ShareIcon />,
  Map: <MapIcon />,
};

function Tab({
  label,
  accessibilityState,
  onPress,
}) {
  const focused = accessibilityState.selected;
  const icon = icons[label];

  return (
    <Pressable onPress={onPress}>
      <View
        style={styles.icon}
      >
        <>{icon}</>
      </View>
    </Pressable>
  );
}

export default Tab;
