/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
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

function TabComponent({
  label,
  onPress,
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={styles.icon}
      >
        {label === 'Camera' && (
          <Image source={CleanAppIcon} style={styles.centralIcon} />
        )}
        {label === 'Cache' && (
          <BasketIcon />
        )}
        {label === 'Leaderboard' && (
          <LeaderboardIcon />
        )}
        {label === 'Referral' && (
          <ShareIcon />
        )}
        {label === 'Map' && (
          <MapIcon />
        )}
      </View>
    </Pressable>
  );
}

export default TabComponent;
