import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleSheet, Text, View, Pressable, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';
import {useTranslation} from 'react-i18next';
import {ReportTile} from '../components/ReportTile';
import {useStateValue} from '../services/State/State';
import PollingService from '../services/PollingService';

type ReportsStackParamList = {
  ReportsScreen: undefined;
  ReportDetails: {report: any};
};

type ReportsScreenNavigationProp = StackNavigationProp<
  ReportsStackParamList,
  'ReportsScreen'
>;

const ReportsScreen = () => {
  const navigation = useNavigation<ReportsScreenNavigationProp>();
  const {t} = useTranslation();
  const [{reports, lastReportsUpdate, totalReports}, dispatch] =
    useStateValue();

  const navigateToReport = (report: any) => {
    navigation.navigate('ReportDetails', {report});
  };

  const handleManualRefresh = () => {
    PollingService.manualPoll();
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString();
    } catch {
      return timeString;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Pressable style={styles.refreshButton} onPress={handleManualRefresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      {lastReportsUpdate && (
        <View style={styles.updateInfo}>
          <Text style={styles.updateText}>
            Last updated: {formatTime(lastReportsUpdate)}
          </Text>
          <Text style={styles.totalText}>Total: {totalReports || 0}</Text>
        </View>
      )}

      <ScrollView
        style={styles.reportsList}
        showsVerticalScrollIndicator={false}>
        {reports && reports.length > 0 ? (
          reports.map((report: any, index: number) => (
            <ReportTile
              key={report.id || index}
              title={report.title}
              description={report.description}
              time={report.time}
              onPress={() => navigateToReport(report)}
            />
          ))
        ) : (
          <View style={styles.noReports}>
            <Text style={styles.noReportsText}>No reports available</Text>
            <Text style={styles.noReportsSubtext}>
              Reports will appear here as they are generated
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.COLORS.WHITE,
  },
  refreshButton: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: theme.COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontFamilies.Default,
  },
  updateInfo: {
    backgroundColor: theme.COLORS.PANEL_BG,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  updateText: {
    color: theme.COLORS.TEXT_GREY,
    fontSize: 12,
    fontFamily: fontFamilies.Default,
    marginBottom: 4,
  },
  totalText: {
    color: theme.COLORS.TEXT_GREY,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontFamilies.Default,
  },
  reportsList: {
    flex: 1,
    paddingHorizontal: 16,
    width: '100%',
  },
  noReports: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noReportsText: {
    color: theme.COLORS.TEXT_GREY,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: fontFamilies.Default,
    marginBottom: 8,
  },
  noReportsSubtext: {
    color: theme.COLORS.TEXT_GREY,
    fontSize: 14,
    fontFamily: fontFamilies.Default,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default ReportsScreen;
