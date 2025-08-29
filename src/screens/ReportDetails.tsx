import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Pressable, StyleSheet, Text, View, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';
import {useTranslation} from 'react-i18next';

type ReportsStackParamList = {
  ReportsScreen: undefined;
  ReportDetails: undefined;
};

type ReportDetailsNavigationProp = StackNavigationProp<
  ReportsStackParamList,
  'ReportDetails'
>;

const ReportDetails = () => {
  const navigation = useNavigation<ReportDetailsNavigationProp>();
  const {t} = useTranslation();

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Report Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Title:</Text>
            <Text style={styles.value}>Sample Report Title</Text>

            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>
              This is a sample report description that shows the details of the
              report.
            </Text>

            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>Pending</Text>

            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>Central Park, New York</Text>

            <Text style={styles.label}>Severity:</Text>
            <Text style={styles.value}>Medium</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsContainer}>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Mark as Complete</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.secondaryButton]}>
              <Text style={styles.secondaryButtonText}>Edit Report</Text>
            </Pressable>
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
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.COLORS.TEXT_GREY,
    marginTop: 12,
    marginBottom: 4,
    fontFamily: fontFamilies.Default,
  },
  value: {
    fontSize: 16,
    color: theme.COLORS.WHITE,
    marginBottom: 8,
    fontFamily: fontFamilies.Default,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamilies.Default,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.COLORS.BTN_BG_BLUE,
  },
  secondaryButtonText: {
    color: theme.COLORS.BTN_BG_BLUE,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamilies.Default,
  },
});

export default ReportDetails;
