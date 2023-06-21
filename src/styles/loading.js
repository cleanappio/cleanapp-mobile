import {StyleSheet} from 'react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 19,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.APP_COLOR_1,
  },
  image: {
    height: 60,
    width: 110,
  },
  image2: {
    height: 190,
    width: 190,
  },
  creatingWallet: {
    marginTop: 70,
    borderRadius: 25,
    marginVertical: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: theme.COLORS.WHITE,
  },
});
