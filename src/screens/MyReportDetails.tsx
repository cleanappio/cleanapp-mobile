import React from 'react';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';
import {useReverseGeocoding} from '../hooks/useReverseGeocoding';
import {useTranslation} from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage';
import ChevronLeft from '../components/ChevronLeft';
import NavigationIcon from '../components/NavigationIcon';

type MyReportsStackParamList = {
  Leaderboard: undefined;
  MyReportDetails: {report: any};
};

type MyReportDetailsNavigationProp = StackNavigationProp<
  MyReportsStackParamList,
  'MyReportDetails'
>;

const MyReportDetails = ({
  route,
}: {
  route: RouteProp<MyReportsStackParamList, 'MyReportDetails'>;
}) => {
  const navigation = useNavigation<MyReportDetailsNavigationProp>();
  const {t} = useTranslation();
  const {report: reportItem} = route.params;
  const report = reportItem.report;
  var englishAnalysis = reportItem.analysis[0];
  for (const analysisItem of reportItem.analysis) {
    if (analysisItem.language === 'en') {
      englishAnalysis = analysisItem;
      break;
    }
  }
  const isPhysical = englishAnalysis?.classification === 'physical';

  const {
    address,
    loading: addressLoading,
    error: addressError,
    refetch: refetchAddress,
  } = useReverseGeocoding({
    latitude: report.latitude,
    longitude: report.longitude,
    language: 'en',
    autoFetch: true,
  });

  // Extract title and description from analysis field with language='en'
  const title = englishAnalysis.title || 'Untitled Report';
  const description = englishAnalysis.description || report.description || '';

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
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown Date';
    }
  };

  const openGoogleMaps = () => {
    if (report.latitude && report.longitude) {
      const url = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;

      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            // Fallback to web browser
            Linking.openURL(url);
          }
        })
        .catch(err => {
          console.error('Error opening Google Maps:', err);
          Alert.alert('Error', 'Could not open Google Maps');
        });
    } else {
      Alert.alert('Location Error', 'No coordinates available for this report');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.COLORS.TEXT_GREY} />
        </Pressable>
        <Text style={styles.headerTitle}>My Report Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Report Image */}
        {report.seq && (
          <View style={styles.imageContainer}>
            <ResponsiveImage
              reportSeq={report.seq}
              resizeMode="contain"
              maxHeight={500}
              borderRadius={0}
            />
          </View>
        )}

        {/* Report Content */}
        <View style={styles.reportContent}>
          <Text style={styles.reportTitle}>{title}</Text>
          {description && (
            <Text style={styles.reportDescription}>{description}</Text>
          )}

          {/* Report Metadata */}
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Date</Text>
              <Text style={styles.metadataValue}>
                {formatDate(report.timestamp)}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Time</Text>
              <Text style={styles.metadataValue}>
                {formatTime(report.timestamp)}
              </Text>
            </View>
          </View>

          {/* Location Information */}
          {isPhysical && (
            <Pressable onPress={openGoogleMaps} style={styles.locationButton}>
              <View style={styles.locationButtonContent}>
                <View style={styles.locationContainer}>
                  {addressLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator
                        size="small"
                        color={theme.COLORS.BTN_BG_BLUE}
                      />
                      <Text style={[styles.value, styles.loadingText]}>
                        Getting address...
                      </Text>
                    </View>
                  ) : addressError ? (
                    <View style={styles.errorContainer}>
                      <Text style={[styles.value, styles.errorText]}>
                        {addressError}
                      </Text>
                      <Pressable
                        onPress={refetchAddress}
                        style={styles.retryButton}>
                        <Text style={styles.retryText}>Retry</Text>
                      </Pressable>
                    </View>
                  ) : address ? (
                    <Text style={[styles.value, styles.locationText]}>
                      {address}
                    </Text>
                  ) : (
                    <Text
                      numberOfLines={3}
                      style={[styles.value, styles.locationText]}>
                      {report.location || 'Address not available'}
                    </Text>
                  )}
                </View>
                <View style={styles.navigationIconContainer}>
                  <NavigationIcon color={theme.COLORS.BTN_BG_BLUE} />
                </View>
              </View>
            </Pressable>
          )}
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.BORDER_GREY,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: theme.COLORS.BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportContent: {
    padding: 16,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    marginBottom: 12,
  },
  reportDescription: {
    fontSize: 16,
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    lineHeight: 24,
    marginBottom: 20,
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metadataItem: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 12,
    color: theme.COLORS.TEXT_GREY_50P,
    fontFamily: fontFamilies.Default,
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 14,
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
  },
  locationContainer: {
    flex: 1,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
  },
  distanceText: {
    fontSize: 12,
    color: theme.COLORS.TEXT_GREY_50P,
    fontFamily: fontFamilies.Default,
    marginBottom: 12,
  },
  locationButton: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.COLORS.BTN_BG_BLUE_30P,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.BTN_BG_BLUE,
  },
  locationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navigationIconContainer: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 14,
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
  },
  loadingText: {
    color: theme.COLORS.TEXT_GREY,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.COLORS.BTN_BG_BLUE_30P || 'rgba(59, 130, 246, 0.3)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.COLORS.BTN_BG_BLUE,
  },
  retryText: {
    color: theme.COLORS.BTN_BG_BLUE,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MyReportDetails;
