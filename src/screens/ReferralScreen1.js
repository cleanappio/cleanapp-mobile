import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';
import {useTranslation} from 'react-i18next';

const ReferralScreen1 = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const navigateToScreen2 = () => {
    navigation.navigate('ReferralScreen2');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <Text style={styles.title}>Referral Screen 1</Text>
        <Text style={styles.subtitle}>
          This is the first screen in the Referral tab
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={navigateToScreen2}>
            <Text style={styles.buttonText}>Go to Screen 2</Text>
          </Pressable>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            • This screen demonstrates navigation within a tab
          </Text>
          <Text style={styles.infoText}>
            • You can navigate to Screen 2 and come back
          </Text>
          <Text style={styles.infoText}>
            • The bottom tab bar remains visible
          </Text>
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
  },
  infoText: {
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    color: theme.COLORS.TEXT_GREY,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default ReferralScreen1;
