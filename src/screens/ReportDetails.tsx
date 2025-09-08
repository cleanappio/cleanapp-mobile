import React from 'react';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';
import {useTranslation} from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage';
import ChevronLeft from '../components/ChevronLeft';
import NavigationIcon from '../components/NavigationIcon';
import {getLocation} from '../functions/geolocation';
import {calculateDistance} from '../utils/calculateDistance';
// import {useReportsContext} from '../contexts/ReportsContext';

type ReportsStackParamList = {
  ReportsScreen: undefined;
  ReportDetails: {report: any};
  ReviewCameraScreen: {report: any};
};

type ReportDetailsNavigationProp = StackNavigationProp<
  ReportsStackParamList,
  'ReportDetails' | 'ReviewCameraScreen'
>;

const ReportDetails = ({
  route,
}: {
  route: RouteProp<
    ReportsStackParamList,
    'ReportDetails' | 'ReviewCameraScreen'
  >;
}) => {
  const navigation = useNavigation<ReportDetailsNavigationProp>();
  const {t} = useTranslation();
  const {report} = route.params;

  const checkDistanceFromReport = async (): Promise<number> => {
    console.log('Checking distance from report');
    const userLocation = await getLocation();
    console.log('User location is ', userLocation);

    console.log('Calculating distance');
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      report.latitude,
      report.longitude,
    );

    console.log('Distance is ', distance, ' meters');
    return distance;
  };

  const goBack = () => {
    navigation.goBack();
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

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <ChevronLeft color={theme.COLORS.WHITE} />
        </Pressable>
        <Text style={styles.headerTitle}>Report Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <View style={{padding: 16, gap: 8}}>
              <Text style={styles.value}>{report.title}</Text>
              <Text style={{...styles.value, fontSize: 14}}>
                {report.description}
              </Text>
            </View>

            <ResponsiveImage
              base64Image={report.image}
              maxHeight={400}
              borderRadius={0}
              showPlaceholder={true}
              placeholderText="No Image Available"
              containerWidth={Dimensions.get('window').width - 32} // Account for screen padding (16) + infoCard padding (16) on each side
            />

            <View style={{padding: 16, flexDirection: 'column', gap: 12}}>
              <View
                style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{formatTime(report.time)}</Text>
              </View>

              {/* <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{report.status}</Text>
            </View> */}

              <View
                style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
                <Text style={styles.label}>Severity:</Text>
                <Text style={styles.value}>{report.severity}</Text>
              </View>

              <View
                style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
                <Text style={styles.label}>Location:</Text>
                <Pressable
                  onPress={openGoogleMaps}
                  style={styles.locationButton}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 4,
                    }}>
                    <Text style={[styles.value, styles.locationText]}>
                      {report.latitude && report.longitude
                        ? `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`
                        : report.location || 'Coordinates not available'}
                    </Text>
                    <NavigationIcon color={theme.COLORS.BTN_BG_BLUE} />
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{padding: 16, height: 70}}>
        <Pressable
          onPress={() => {
            // checkDistanceFromReport().then(distance => {
            //   if (distance < 50) {
            //     console.log('Distance is less than 50 meters');
            //     navigation.navigate('ReviewCameraScreen', {report});
            //   } else {
            //     console.log('Distance is greater than 50 meters');
            //   }
            // });
            navigation.navigate('ReviewCameraScreen', {report});
          }}
          style={styles.reviewButton}>
          <Text style={[styles.value, styles.reviewButtonText]}>
            Review Report
          </Text>
        </Pressable>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.BORDER_GREY,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: theme.COLORS.BTN_BG_BLUE,
    fontSize: 16,
    fontFamily: fontFamilies.Default,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.COLORS.WHITE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.COLORS.WHITE,
    marginBottom: 12,
    fontFamily: fontFamilies.Default,
  },
  infoCard: {
    backgroundColor: theme.COLORS.PANEL_BG,
    borderRadius: 8,
    flexDirection: 'column',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
  },
  value: {
    fontSize: 14,
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
  },
  locationButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.COLORS.BTN_BG_BLUE_30P,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.BTN_BG_BLUE,
  },
  locationText: {
    color: theme.COLORS.BTN_BG_BLUE,
    fontWeight: '600',
  },
  mapLink: {
    fontSize: 12,
    color: theme.COLORS.BTN_BG_BLUE,
    fontFamily: fontFamilies.Default,
    marginTop: 4,
    textAlign: 'center',
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.COLORS.GREEN_TEAM_BG,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonText: {
    color: theme.COLORS.WHITE,
    fontWeight: '600',
  },
});

export default ReportDetails;
