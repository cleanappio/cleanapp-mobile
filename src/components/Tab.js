/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Image, Pressable, StyleSheet, View, Text} from 'react-native';
import LeaderboardIcon from '../assets/ico_leaderboard.svg';
import MapIcon from '../assets/ico_map.svg';
import ShareIcon from '../assets/ico_share.svg';
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
});

function TabComponent({
  label,
  onPress,
  notifiedReports = [],
  openedReports = [],
  isNewReport = () => false,
  isReportOpened = () => false,
  toastMessage = '',
  showToast = false,
  hideToast = () => {},
  saveNotifiedReports = () => {},
  clearNotifiedReports = () => {},
  setToastMessage = () => {},
  setShowToast = () => {},
  markReportAsRead = () => {},
  markReportAsOpened = () => {},
}) {
  const [{reports}] = useStateValue();

  // Note: openedReports is now managed by the useNotifiedReports hook
  // and passed down as a prop, so no local state management is needed

  // Test function to mark all reports as read
  const markAllAsRead = () => {
    const allReportIds = reports.map(r => r.id);
    saveNotifiedReports(allReportIds);
  };

  // Test function to clear all notified reports
  const clearAllNotifiedReports = () => {
    // clearNotifiedReports();
    testToast();
    // removeSomeIds(); // Commented out since we're not using it anymore
    return;
  };

  // Test function to remove some IDs from AsyncStorage to simulate new reports
  // const removeSomeIds = async () => {
  //   console.log('🧪 [TabComponent] removeSomeIds called');
  //   try {
  //     const currentReadReports = await getReadReports();
  //     if (currentReadReports) {
  //       const parsed = JSON.parse(currentReadReports);
  //       console.log('🧪 [TabComponent] Current read reports:', parsed);

  //       // Remove first 2 IDs to simulate new reports
  //       const reduced = parsed.slice(2);
  //       console.log('🧪 [TabComponent] Reduced read reports:', reduced);

  //       await saveReadReports(reduced);
  //       console.log('✅ [TabComponent] Successfully removed some IDs');
  //     }
  //   } catch (error) {
  //     console.error('❌ [TabComponent] Error removing some IDs:', error);
  //   }
  // };

  // Test function to manually trigger toast
  const testToast = () => {
    // Manually set toast state for testing
    if (
      typeof setToastMessage === 'function' &&
      typeof setShowToast === 'function'
    ) {
      // Test with a simple message first
      setToastMessage('🧪 Test Toast Message');
      setShowToast(true);
    }
  };

  // Calculate unopened reports count (for notification badge)
  const unopenedCount = reports.filter(
    report => !openedReports.includes(report.id),
  ).length;

  return (
    <Pressable onPress={onPress}>
      {/* onPress={any => {
        if (label === 'Reports') {
          // Test: Try to trigger toast manually first
          testToast();
          // Then remove some IDs to simulate new reports
          removeSomeIds();
          // Don't call onPress for Reports tab during testing
          // return;
        }
        onPress(any);
      }}> */}
      <View style={styles.icon}>
        {label === 'Camera' && (
          <Image source={CleanAppIcon} style={styles.centralIcon} />
        )}
        {label === 'Cache' && <MemberIcon />}
        {label === 'Leaderboard' && <LeaderboardIcon />}
        {label === 'Reports' && (
          <View style={{position: 'relative'}}>
            <ReportIcon />
            <View
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
                backgroundColor: unopenedCount === 0 ? 'transparent' : 'red',
                borderRadius: 10,
                padding: 2,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {unopenedCount !== 0 && (
                <Text
                  style={{color: 'white', fontSize: 10, fontWeight: 'bold'}}>
                  {unopenedCount}
                </Text>
              )}
            </View>
          </View>
        )}
        {label === 'Map' && <MapIcon />}
      </View>
    </Pressable>
  );
}

export default TabComponent;
