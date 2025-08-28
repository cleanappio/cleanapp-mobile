import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '../services/Common/theme';
import {useTranslation} from 'react-i18next';
import {ReportTile} from '../components/ReportTile';

type ReportsStackParamList = {
  ReportsScreen: undefined;
  ReportDetails: undefined;
};

type ReportsScreenNavigationProp = StackNavigationProp<
  ReportsStackParamList,
  'ReportsScreen'
>;

const ReportsScreen = () => {
  const navigation = useNavigation<ReportsScreenNavigationProp>();
  const {t} = useTranslation();

  const navigateToReport = () => {
    navigation.navigate('ReportDetails');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>
      <ReportTile
        title="Report Title"
        description="Report Description"
        time="10:00 AM"
        onPress={navigateToReport}
      />
      <ReportTile
        title="Report Title"
        description="Report Description"
        time="10:00 AM"
        onPress={navigateToReport}
      />
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.COLORS.WHITE,
  },
});

export default ReportsScreen;
