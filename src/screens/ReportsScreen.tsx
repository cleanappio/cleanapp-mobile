import React, {useEffect, useState} from 'react';
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
import {useReportsContext} from '../contexts/ReportsContext';

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
  const {markReportAsRead, markReportAsOpened, openedReports} =
    useReportsContext();

  const navigateToReport = (report: any) => {
    markReportAsOpened(report.id);
    navigation.navigate('ReportDetails', {report});
  };

  // Function to check if a report is opened
  const isReportOpened = (reportId: string | number): boolean => {
    return openedReports.includes(reportId);
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

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    } catch {
      return 'Unknown Date';
    }
  };

  const groupReportsByDate = (reportsList: any[]) => {
    if (!reportsList || reportsList.length === 0) return {};

    const grouped: {[key: string]: any[]} = {};

    reportsList.forEach(report => {
      const dateKey = formatDate(report.timestamp || report.time);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(report);
    });

    // Sort dates in descending order: Today (1st), Yesterday (2nd), then older dates (newest first)
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      // Today always comes first
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;

      // Yesterday comes second
      if (a === 'Yesterday') return -1;
      if (b === 'Yesterday') return 1;

      // For other dates, sort chronologically (newest first)
      try {
        const dateA = new Date(
          reportsList.find(r => formatDate(r.timestamp || r.time) === a)
            ?.timestamp || '',
        );
        const dateB = new Date(
          reportsList.find(r => formatDate(r.timestamp || r.time) === b)
            ?.timestamp || '',
        );
        return dateB.getTime() - dateA.getTime();
      } catch {
        return 0;
      }
    });

    const sortedGrouped: {[key: string]: any[]} = {};
    sortedDates.forEach(date => {
      sortedGrouped[date] = grouped[date];
    });

    return sortedGrouped;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Review Nearby Reports</Text>
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
          (() => {
            const groupedReports = groupReportsByDate(reports);
            return Object.entries(groupedReports).map(([date, dateReports]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{date}</Text>
                {dateReports.map((report: any, index: number) => (
                  <ReportTile
                    key={report.id || `${date}_${index}`}
                    title={report.title}
                    description={report.description}
                    time={report.time}
                    onPress={() => navigateToReport(report)}
                    reportImage={report.image}
                    isReportOpened={isReportOpened(report.id)}
                  />
                ))}
              </View>
            ));
          })()
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
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    marginBottom: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.BORDER_GREY,
    paddingBottom: 8,
  },
  // Stored Read Reports Styles
  storedReportsSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  storedReportsCard: {
    backgroundColor: theme.COLORS.PANEL_BG || '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  storedReportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storedReportsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.COLORS.WHITE,
  },
  storedReportsSubtext: {
    fontSize: 14,
    color: theme.COLORS.TEXT_GREY,
    marginBottom: 8,
  },
  reportIdsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  reportIdItem: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reportIdText: {
    fontSize: 12,
    color: theme.COLORS.WHITE,
    fontWeight: '500',
  },
  storedReportsButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 12,
    color: theme.COLORS.WHITE,
    fontWeight: '500',
  },
  manualRefreshButton: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  manualRefreshButtonText: {
    fontSize: 12,
    color: theme.COLORS.WHITE,
    fontWeight: '500',
  },
});

export default ReportsScreen;
