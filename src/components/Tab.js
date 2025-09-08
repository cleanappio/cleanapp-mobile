import React from 'react';
import {Image, Pressable, StyleSheet, View, Text} from 'react-native';
import LeaderboardIcon from '../assets/ico_leaderboard.svg';
import MapIcon from '../assets/ico_map.svg';
import MemberIcon from '../assets/ico_member.svg';
import ReportIcon from './ReportIcon';
const CleanAppIcon = require('../assets/CleanApp_Logo.png');
import {useStateValue} from '../services/State/State';

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

function TabComponent({label, onPress, openedReports = []}) {
  const [{reports}] = useStateValue();

  // Calculate unopened reports count for notification badge
  const unopenedCount = reports.filter(
    report => !openedReports.includes(report.id),
  ).length;

  const renderIcon = () => {
    switch (label) {
      case 'Camera':
        return <Image source={CleanAppIcon} style={styles.centralIcon} />;
      case 'Cache':
        return <MemberIcon />;
      case 'Leaderboard':
        return <LeaderboardIcon />;
      case 'Reports':
        return (
          <View style={styles.reportsContainer}>
            <ReportIcon />
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
        return <MapIcon />;
      default:
        return null;
    }
  };

  return (
    <Pressable onPress={onPress}>
      <View style={styles.icon}>{renderIcon()}</View>
    </Pressable>
  );
}

export default TabComponent;
