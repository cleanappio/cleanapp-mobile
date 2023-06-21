import {StyleSheet} from 'react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';

export const styles = StyleSheet.create({
  bigTextView: {
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: theme.COLORS.WHITE,
  },
  container: {
    flex: 1,
    marginTop: '2%',
    paddingTop: '5%',
    paddingHorizontal: '4%',
  },
  rows: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickra: {
    fontSize: 27,
    fontWeight: '600',
    lineHeight: 33,
    color: theme.APP_COLOR,
    fontFamily: fontFamilies.DefaultBold,
  },
  ocean: {
    color: '#8C98A9',
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 20,
    fontWeight: '600',
  },
  txtPortfolio: {
    color: theme.COLORS.BLACK,
    fontSize: 16,
    fontFamily: fontFamilies.Default,
  },
  txtOceanDelta: {
    color: '#84c380',
    fontSize: 20,
    fontFamily: fontFamilies.Default,
  },
  containers: {
    flex: 2,
    backgroundColor: '#9999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapperStyle: {
    backgroundColor: '#00000000',
    borderBottomColor: '#000000',
    borderBottomWidth: 1,
  },
  buttons: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
    borderColor: '#ffffff',
    borderWidth: 1,
    shadowColor: 'rgba(0,0,0,.12)',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 25,
    width: '40%',
    alignSelf: 'center',
  },
  button2: {
    borderRadius: 25,
    alignSelf: 'center',
    width: '80%',
  },
  buttonText: {
    marginVertical: 7,
    fontSize: 18,
    color: theme.COLORS.WHITE,
    textTransform: 'uppercase',
    fontFamily: fontFamilies.DefaultBold,
  },
  txtBalance: {
    fontSize: 27,
    lineHeight: 31,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.WHITE,
  },
  txtCurrency: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.WHITE,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
    borderColor: theme.COLORS.BORDER_GOLD,
    padding: 16,
  },
  border: {
    height: 2,
    width: '100%',
    backgroundColor: theme.APP_COLOR_2,
  },
  cardBorder: {
    backgroundColor: theme.COLORS.BORDER_GOLD,
    marginTop: 10,
    height: 1,
    width: '100%',
  },
  right: {
    width: '100%',
    alignItems: 'flex-end',
  },
});
