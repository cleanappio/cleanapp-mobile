import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';
import AppVersionDisplay from '../components/AppVersionDisplay';
import {useAppVersion} from '../hooks/useAppVersion';

/**
 * Example screen showing how to display app version information
 */
const VersionInfoScreen: React.FC = () => {
  const {versionInfo, loading, error, refetch} = useAppVersion();

  const showVersionDetails = () => {
    if (versionInfo) {
      Alert.alert(
        'Version Details',
        `App: ${versionInfo.appName}\n` +
          `Version: ${versionInfo.version}\n` +
          `Build: ${versionInfo.buildNumber}\n` +
          `Version Code: ${versionInfo.versionCode}\n` +
          `Bundle ID: ${versionInfo.bundleId}\n` +
          `Platform: ${versionInfo.platform.toUpperCase()}`,
        [{text: 'OK'}],
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>App Version Information</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Simple Version Display</Text>
          <AppVersionDisplay />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>With Build Number</Text>
          <AppVersionDisplay showBuildNumber={true} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>With Platform</Text>
          <AppVersionDisplay showBuildNumber={true} showPlatform={true} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>With Bundle ID</Text>
          <AppVersionDisplay
            showBuildNumber={true}
            showPlatform={true}
            showBundleId={true}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clickable Version</Text>
          <AppVersionDisplay
            showBuildNumber={true}
            showPlatform={true}
            onPress={showVersionDetails}
            style={styles.clickableVersion}
            textStyle={styles.clickableText}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Raw Version Info</Text>
          {loading ? (
            <Text style={styles.infoText}>Loading...</Text>
          ) : error ? (
            <Text style={styles.errorText}>Error: {error}</Text>
          ) : versionInfo ? (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Full Version String: {versionInfo.fullVersionString}
              </Text>
              <Text style={styles.infoText}>
                Platform: {versionInfo.platform.toUpperCase()}
              </Text>
              <Text style={styles.infoText}>
                Bundle ID: {versionInfo.bundleId}
              </Text>
            </View>
          ) : (
            <Text style={styles.infoText}>No version info available</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage Examples</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>
              {`// Simple version display
<AppVersionDisplay />

// With build number
<AppVersionDisplay showBuildNumber={true} />

// With platform info
<AppVersionDisplay 
  showBuildNumber={true} 
  showPlatform={true} 
/>

// Clickable version
<AppVersionDisplay 
  onPress={() => Alert.alert('Version', 'Info')}
  showBuildNumber={true}
/>

// Using the hook directly
const {versionInfo, loading, error} = useAppVersion();`}
            </Text>
          </View>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: theme.COLORS.PANEL_BG,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    marginBottom: 10,
  },
  clickableVersion: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE_30P,
    borderRadius: 8,
    padding: 10,
  },
  clickableText: {
    color: theme.COLORS.BTN_BG_BLUE,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontFamily: fontFamilies.Default,
  },
  codeContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  codeText: {
    fontSize: 12,
    color: '#00ff00',
    fontFamily: 'Courier',
    lineHeight: 18,
  },
});

export default VersionInfoScreen;
