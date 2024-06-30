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
  icon: {
    width: 65,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralIcon: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const icons = {
  Cache: <BasketIcon />,
  Leaderboard: <LeaderboardIcon />,
  Camera: <Image source={CleanAppIcon} style={styles.centralIcon} />,
  Referral: <ShareIcon />,
  Map: <MapIcon />,
};

function Tab({
  label,
  onPress,
}) {
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
