import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';
import {useTranslation} from 'react-i18next';

const ReportDetails = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <Text style={styles.title}>Referral Screen 2</Text>
        <Text style={styles.subtitle}>
          This is the second screen in the Referral tab
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={goBack}>
            <Text style={styles.buttonText}>Go Back to Screen 1</Text>
          </Pressable>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            • You've successfully navigated to Screen 2
          </Text>
          <Text style={styles.infoText}>
            • Use the back button to return to Screen 1
          </Text>
          <Text style={styles.infoText}>
            • The bottom tab bar is still visible
          </Text>
          <Text style={styles.infoText}>
            • This demonstrates stack navigation within a tab
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Navigation Stats</Text>
          <Text style={styles.statsText}>
            • Current Screen: ReferralScreen2
          </Text>
          <Text style={styles.statsText}>
            • Previous Screen: ReferralScreen1
          </Text>
          <Text style={styles.statsText}>• Tab: Referral</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.BG,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: fontFamilies.Default,
    fontSize: 28,
    fontWeight: '600',
    color: theme.COLORS.TEXT_GREY,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamilies.Default,
    fontSize: 18,
    color: theme.COLORS.TEXT_GREY,
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
  },
  buttonText: {
    fontFamily: fontFamilies.Default,
    fontSize: 18,
    fontWeight: '600',
    color: theme.COLORS.WHITE,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: theme.COLORS.PANEL_BG,
    padding: 20,
    borderRadius: 12,
    maxWidth: 300,
    marginBottom: 20,
  },
  infoText: {
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    color: theme.COLORS.TEXT_GREY,
    marginBottom: 8,
    lineHeight: 20,
  },
  statsContainer: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE_30P,
    padding: 20,
    borderRadius: 12,
    maxWidth: 300,
    borderWidth: 1,
    borderColor: theme.COLORS.BTN_BG_BLUE,
  },
  statsTitle: {
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.TEXT_GREY,
    marginBottom: 12,
    textAlign: 'center',
  },
  statsText: {
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    color: theme.COLORS.TEXT_GREY,
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default ReportDetails;
