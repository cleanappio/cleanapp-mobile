import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {fontFamilies} from '../utils/fontFamilies';
import {theme} from '../services/Common/theme';

interface ReportTileProps {
  title: string;
  description: string;
  time: string;
  onPress: () => void;
}

export const ReportTile = ({
  title,
  description,
  time,
  onPress,
}: ReportTileProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.row}>
        <View style={{...styles.col, flex: 3}}>
          <Text style={styles.txt12} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.txt12} numberOfLines={2}>
            {description}
          </Text>
        </View>

        <View style={{...styles.col, flex: 2}}>
          <Text style={styles.txt12} numberOfLines={1}>
            {time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    paddingHorizontal: 0,
    paddingVertical: 12,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  col: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 4,
    flex: 1,
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
    overflow: 'hidden',
  },
  txt16: {
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.COLORS.TEXT_GREY,
  },
});
