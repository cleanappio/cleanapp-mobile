import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { fontFamilies } from '../utils/fontFamilies';
import { theme } from '../services/Common/theme';

interface ReportTileProps {
  title: string;
  description: string;
  time: string;
  onPress: () => void;
}

export const ReportTile = ({title, description, time, onPress}: ReportTileProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.col}>
        <Text style={styles.txt14}>{title}</Text>
        <Text style={styles.txt12}>{description}</Text>
        </View>
        <Text style={styles.txt12}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 4,
  },
  txt12: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  txt14: {
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  txt16: {
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.COLORS.TEXT_GREY,
  },
});
