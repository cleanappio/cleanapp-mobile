/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import {
  Dimensions,
  Image,
  // ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '../services/Common/theme';
import { fontFamilies } from '../utils/fontFamilies';
import Ripple from '../components/Ripple';
import { getTeam, getUserName, getWalletAddress } from '../services/DataManager';
import {
  getTeams,
  getTopScores,
  getReportsById,
  getReportImage,
} from '../services/API/APIManager';
import { useStateValue } from '../services/State/State';
import { useFocusEffect } from '@react-navigation/native';

import LinearGradient from 'react-native-linear-gradient';
import RenderStat from '../components/RenderStat';

const Tab = ({ title, icon, value, isSelected, setTab }) => {
  return (
    <Ripple
      style={StyleSheet.flatten([
        styles.tab,
        isSelected ? styles.tabActive : {},
      ])}
      onPress={() => setTab(value, title)}>
      {icon}
      <Text style={[
        styles.tabText,
        isSelected ? styles.tabTextActive : {}
      ]}>{title}</Text>
    </Ripple>
  );
};

export const Leaderboard = (props) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [{ }, dispatch] = useStateValue();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userName, setName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [newName, setNewName] = useState(false);
  const nameRef = useRef(null);
  const [userIndex, setUserIndex] = useState(-1);

  const [leaderboardPlayers, setLeaderboardPlayers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [created, setCreated] = useState(false);

  const [blueStat, setBlueStat] = useState(0);
  const [greenStat, setGreenStat] = useState(0);
  const [userTeam, setUserTeam] = useState('');

  // MyReports state
  const [myReports, setMyReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState(null);
  const [refreshingReports, setRefreshingReports] = useState(false);
  const [reportImages, setReportImages] = useState({}); // Store loaded images by report seq

  const fetchData = async () => {
    const wallet = await getWalletAddress();
    if (wallet) {
      setWalletAddress(wallet);
    }

    publicAddress = await getWalletAddress();

    getTopScores(publicAddress).then((userrankResponse) => {
      if (userrankResponse && userrankResponse.ok) {
        setLeaderboardPlayers(userrankResponse.records);
        const _index = userrankResponse.records.findIndex(
          (record) => record.is_you,
        );
        if (_index !== -1) {
          setUserIndex(_index);
        }
      }
    });

    getTeams(publicAddress).then(async (teamResponse) => {
      if (teamResponse && teamResponse.ok) {
        setBlueStat(teamResponse.blue);
        setGreenStat(teamResponse.green);
        const team = await getTeam();
        setUserTeam(team);
      }
    });

    getUserName().then((data) => {
      setName(data.userName);
      setNewName(data.userName);
    });
  };

  const fetchMyReports = async () => {
    if (!walletAddress) {
      console.log('No wallet address available for fetching reports');
      return;
    }

    setIsLoadingReports(true);
    setReportsError(null);

    try {
      const response = await getReportsById(walletAddress);
      
      if (response && response.ok) {
        // Handle different possible response structures
        let reportsData = response.reports.reports;
        setMyReports(reportsData);
        
        // Load images for the reports
        if (Array.isArray(reportsData)) {
          loadReportImages(reportsData);
        }
      } else {
        setReportsError(response?.error || 'Failed to fetch reports');
        setMyReports([]);
      }
    } catch (error) {
      console.error('Error fetching my reports:', error);
      setReportsError('Failed to fetch reports');
      setMyReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleRefreshReports = async () => {
    setRefreshingReports(true);
    await fetchMyReports();
    setRefreshingReports(false);
  };

  const navigateToReport = (report) => {
    // Get the image URL if it's been loaded
    const imageUrl = report.report?.seq ? reportImages[report.report.seq] : null;
    
    // Navigate to MyReportDetails within the Leaderboard stack
    navigation.navigate('MyReportDetails', { 
      report,
      imageUrl: imageUrl
    });
  };

  const loadReportImages = async (reports) => {
    if (!Array.isArray(reports)) return;

    // Create individual async functions for each image load
    reports.map(async (report) => {
      if (report.report.seq && !reportImages[report.report.seq]) {
        try {
          const imageResponse = await getReportImage(report.report.seq);
          if (imageResponse.ok && imageResponse.imageUrl) {
            setReportImages(prev => ({
              ...prev,
              [report.report.seq]: imageResponse.imageUrl
            }));
          } else {
            console.log('Failed to load image for seq:', report.report.seq, imageResponse.error);
          }
        } catch (error) {
          console.error('Error loading image for report seq:', report.report.seq, error);
        }
      }
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
      fetchMyReports();
    }, []),
  );

  const LeaderboardPlayers = () => {
    return (
      <GestureHandlerRootView>
        <FlatList
          data={leaderboardPlayers}
          keyExtractor={(item, index) => index}
          renderItem={RenderStat}
        />
      </GestureHandlerRootView>
    );
  };

  const MyReports = () => {
    const formatTime = (timeString) => {
      try {
        return new Date(timeString).toLocaleTimeString();
      } catch {
        return timeString;
      }
    };

    const formatDate = (timestamp) => {
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

    const groupReportsByDate = (reportsList) => {
      // Add more robust validation
      if (!reportsList) {
        return {};
      }
      
      if (reportsList.length === 0) {
        console.log('reportsList is empty array');
        return {};
      }

      const grouped = {};

      reportsList.forEach(report => {
        const dateKey = formatDate(report.report.timestamp);
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

      const sortedGrouped = {};
      sortedDates.forEach(date => {
        sortedGrouped[date] = grouped[date];
      });

      return sortedGrouped;
    };

    if (isLoadingReports && myReports.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.COLORS.BTN_BG_BLUE} />
          <Text style={styles.loadingText}>Loading your reports...</Text>
        </View>
      );
    }

    if (reportsError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {reportsError}</Text>
          <Ripple style={styles.retryButton} onPress={fetchMyReports}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Ripple>
        </View>
      );
    }

    if (myReports.length === 0) {
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            {t('leaderboard.myReportsPlaceholder')}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.reportsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingReports}
            onRefresh={handleRefreshReports}
            tintColor={theme.COLORS.BTN_BG_BLUE}
            colors={[theme.COLORS.BTN_BG_BLUE]}
            title="Pull to refresh"
            titleColor={theme.COLORS.TEXT_GREY}
          />
        }>
        {(() => {
          // Ensure myReports is a valid array before processing
          const validReports = Array.isArray(myReports) ? myReports : [];
          const groupedReports = groupReportsByDate(validReports);
          return Object.entries(groupedReports).map(([date, dateReports]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {dateReports.map((report, index) => {
                // Extract title and description from analysis field with language='en'
                var englishAnalysis = {};
                for (const analysis of report.analysis) {
                  if (analysis.language === 'en') {
                    englishAnalysis = analysis;
                    break;
                  }
                }
                const title = englishAnalysis.title || 'Untitled Report';
                const description = englishAnalysis.description || '';
                
                // Get image URL for this report
                const imageUrl = report.report.seq ? reportImages[report.report.seq] : null;
                
                return (
                  <Pressable 
                    key={report.id || `${date}_${index}`} 
                    style={({ pressed }) => [
                      styles.reportItem,
                      pressed && styles.reportItemPressed
                    ]}
                    onPress={() => navigateToReport(report)}
                  >
                    {report.report.seq && (
                      <View style={styles.reportImageContainer}>
                        {imageUrl ? (
                          <Image 
                            source={{ uri: imageUrl }} 
                            style={styles.reportImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.imagePlaceholder}>📷</Text>
                        )}
                      </View>
                    )}
                    <View style={styles.reportContent}>
                      <Text style={styles.reportTitle} numberOfLines={2}>
                        {title}
                      </Text>
                      {description && (
                        <Text style={styles.reportDescription} numberOfLines={3}>
                          {description}
                        </Text>
                      )}
                      <Text style={styles.reportTime}>
                        {formatTime(report.report.timestamp || report.report.time)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ));
        })()}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={{ marginTop: 25 }}>
          <View style={{ ...styles.card, paddingHorizontal: 0 }}>
            {(joined || created) && (
              <View style={styles.guildstatcontainer}>
                <Text style={styles.guildstat}>
                  {joined
                    ? t('leaderboard.guildjoined')
                    : t('leaderboard.guildcreated')}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.statusContainer}>
            <LinearGradient
              end={{ x: 0, y: 0.5 }}
              start={{ x: 1, y: 0.5 }}
              colors={[
                theme.COLORS.GRADIENT_BLUE_BEGIN,
                theme.COLORS.GRADIENT_BLUE_END,
              ]}
              style={{
                ...styles.statusbar_left,
                marginRight: 10,
                flex:
                  blueStat + greenStat === 0
                    ? 1
                    : blueStat / (blueStat + greenStat),
              }}>
              <View style={styles.blueBall} />
            </LinearGradient>
            <LinearGradient
              end={{ x: 1, y: 0.5 }}
              start={{ x: 0, y: 0.5 }}
              colors={[
                theme.COLORS.GRADIENT_GREEN_BEGIN,
                theme.COLORS.GRADIENT_GREEN_END,
              ]}
              style={{
                ...styles.statusbar_right,
                marginLeft: 10,
                flex:
                  blueStat + greenStat === 0
                    ? 1
                    : greenStat / (blueStat + greenStat),
              }}>
              <View style={styles.greenBall} />
            </LinearGradient>
          </View>
        </View>
        <View
          style={{
            ...styles.card,
            marginTop: 11,
            borderBottomWidth: 0.4,
            borderBottomColor: theme.COLORS.TEXT_GREY,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingBottom: 32,
          }}>
          <View style={styles.statContainer}>
            <Text style={styles.statTitle}>
              {t('leaderboard.teamblue')}
              {userTeam === '1' ? `  (Your team)` : ''}
            </Text>
            <Text style={styles.blueStat}>{`${blueStat} ${t(
              'leaderboard.kitn',
            )}`}</Text>
          </View>
          <View style={styles.statContainer}>
            <Text style={{ ...styles.statTitle, textAlign: 'right' }}>
              {userTeam === '2' ? `(Your team)   ` : ''}
              {t('leaderboard.teamgreen')}
            </Text>
            <Text
              style={{
                ...styles.greenStat,
                textAlign: 'right',
              }}>{`${greenStat} ${t('leaderboard.kitn')}`}</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <Tab
            title={t('leaderboard.players')}
            isSelected={selectedIndex === 0}
            setTab={() => {
              setSelectedIndex(0);
            }}
          />
          <Tab
            title={t('leaderboard.myReports')}
            isSelected={selectedIndex === 1}
            setTab={() => {
              setSelectedIndex(1);
              // Fetch reports when My Reports tab is activated
              fetchMyReports();
            }}
          />
        </View>

        {selectedIndex === 0 && <LeaderboardPlayers />}
        {selectedIndex === 1 && <MyReports />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.COLORS.BG,
  },
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.BG,
  },

  card: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  inputContainer: {
    backgroundColor: theme.APP_COLOR_2,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  inputText: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '400',
  },

  inputTextReadOnly: {
    paddingVertical: 15,
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '400',
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: theme.APP_COLOR_2,
  },
  headerText: {
    fontFamily: fontFamilies.Default,
    textTransform: 'uppercase',
    color: theme.COLORS.WHITE,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 21,
  },
  subHeaderText: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '400',
    color: theme.COLORS.TULIP_TREE,
    marginTop: 4,
    marginBottom: 16,
  },
  tabContainer: {
    marginTop: 22,
    marginBottom: 16,
    flexDirection: 'row',
    width: '100%',
    padding: 0,
    backgroundColor: theme.COLORS.PANEL_BG,
    justifyContent: 'space-evenly',
  },
  tab: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    minWidth: 100,
  },
  tabActive: {},
  tabText: {
    marginLeft: 8,
    color: theme.COLORS.TEXT_GREY,
    fontSize: 16,
    lineHeight: 16,
    fontFamily: fontFamilies.Default,
    fontWeight: '400',
  },
  tabTextActive: {
    color: theme.COLORS.BTN_BG_BLUE,
    fontWeight: '600',
  },
  indicator: {
    backgroundColor: theme.COLORS.TEXT_GREY,
    height: 3,
    borderRadius: 3,
    marginTop: 11,
    width: '100%',
  },
  icon: {
    width: 26,
    height: 26,
  },
  listContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rank: {
    width: '15%',
    color: theme.COLORS.WHITE,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
  },
  name: {
    marginLeft: 7,
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
  },
  count: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: theme.APP_COLOR_2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  txt9: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 9,
    lineHeight: 24,
    fontWeight: '400',
  },
  txt12: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 24,
  },
  txt16: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
  txtTip: {
    fontSize: 12,
    color: 'white',
    fontWeight: '400',
    lineHeight: 15,
    marginTop: 24,
  },
  sortTip: {
    fontSize: 12,
    color: theme.COLORS.TULIP_TREE,
    fontWeight: '400',
    lineHeight: 15,
    fontStyle: 'italic',
    fontFamily: fontFamilies.Default,
  },

  menuBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: Dimensions.get('window').width - 58,
  },
  menuText: {
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: 'white',
    textTransform: 'none',
  },
  menuButtonOuter: {
    backgroundColor: theme.APP_COLOR_2,
    width: Dimensions.get('window').width - 58,
    borderRadius: 8,
    marginTop: 4,
  },
  menuOption: {
    //    width: '100%'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: theme.APP_COLOR,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    margin: 6,
    marginRight: 10,
  },
  buttonCancel: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    margin: 6,
    marginLeft: 10,
    backgroundColor: 'red',
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: 'gray',
    width: 165,
    height: 40,
    borderRadius: 7,
    padding: 0,
    marginTop: 11,
    lineHeight: 15.1,
    fontFamily: fontFamilies.DefaultLight,
    color: theme.COLORS.BLACK,
    textAlign: 'center',
  },
  inputDivider: {
    height: 1,
    marginVertical: 18,
    backgroundColor: theme.COLORS.TULIP_TREE,
  },
  inputLabel: {
    fontSize: 12,
    lineHeight: 11.5,
    fontFamily: fontFamilies.DefaultBold,
    textTransform: 'uppercase',
    color: theme.COLORS.BLACK,
  },
  buttonsRow: {
    flexDirection: 'row',
  },

  title: {
    fontFamily: fontFamilies.Default,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: theme.COLORS.TEXT_GREY,
  },

  statusContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statusbar_left: {
    height: 21,
    borderTopRightRadius: 45,
    borderBottomRightRadius: 45,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 5,
  },
  statusbar_right: {
    height: 21,
    borderTopLeftRadius: 45,
    borderBottomLeftRadius: 45,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 5,
  },
  statContainer: {},
  statTitle: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 15,
    marginBottom: 6,
  },
  blueStat: {
    color: theme.COLORS.BLUE_TEAM_BG,
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  greenStat: {
    color: theme.COLORS.GREEN_TEAM_BG,
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  greenBall: {
    width: 14,
    height: 14,
    borderRadius: 14,
    backgroundColor: theme.COLORS.GREEN_CIRCLE,
  },
  blueBall: {
    width: 14,
    height: 14,
    borderRadius: 14,
    backgroundColor: theme.COLORS.BLUE_CIRCLE,
  },
  leaderboard_title: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  guildstatcontainer: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE_30P,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  guildstat: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '300',
    color: theme.COLORS.TEXT_GREY,
  },

  sheetContainer: {
    flex: 1,
    backgroundColor: theme.APP_COLOR_1,
    paddingVertical: 22,
    paddingHorizontal: 16,
    zIndex: 999,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  guildName: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
    color: theme.COLORS.TEXT_GREY,
  },
  guild_desc: {
    marginTop: 20,
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.COLORS.TEXT_GREY,
  },
  tagsContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  chip: {
    marginVertical: 5,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: theme.COLORS.BTN_BG_BLUE,
    backgroundColor: theme.COLORS.BTN_BG_BLUE_30P,
    alignItems: 'center',
    height: 21,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 14,
    color: theme.COLORS.TEXT_GREY,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  placeholderText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontWeight: '400',
    textAlign: 'center',
  },
  // MyReports styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: theme.COLORS.WELL_READ,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.COLORS.WHITE,
    fontSize: 16,
    fontFamily: fontFamilies.Default,
    fontWeight: '600',
  },
  reportsList: {
    flex: 1,
    paddingHorizontal: 16,
    width: '100%',
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
  reportItem: {
    backgroundColor: theme.COLORS.PANEL_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reportItemPressed: {
    backgroundColor: theme.COLORS.APP_COLOR_2,
    opacity: 0.8,
  },
  reportContent: {
    flex: 1,
    marginLeft: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    lineHeight: 20,
    marginBottom: 8,
  },
  reportTime: {
    fontSize: 12,
    color: theme.COLORS.TEXT_GREY_50P,
    fontFamily: fontFamilies.Default,
  },
  reportImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: theme.COLORS.APP_COLOR_2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  reportImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    fontSize: 24,
  },
});
