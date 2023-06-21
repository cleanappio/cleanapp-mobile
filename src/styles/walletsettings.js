import {StyleSheet} from 'react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '5.5%',
    paddingHorizontal: '4.2%',
  },
  readOnlyBox: {
    padding: 10,
    minHeight: 94,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: '9.2%',
    backgroundColor: theme.APP_COLOR_1,
    borderColor: theme.COLORS.TULIP_TREE,
  },
  readOnlyBoxShadow: {
    shadowColor: theme.COLORS.TULIP_TREE,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    elevation: 4,
  },
  titleCopyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textBoxTitle: {
    fontSize: 10,
    lineHeight: 11.5,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.WHITE,
    textTransform: 'uppercase',
  },
  textBoxValue: {
    fontSize: 11,
    lineHeight: 15.1,
    marginTop: 15,
    fontFamily: fontFamilies.DefaultLight,
    textTransform: 'uppercase',
    color: theme.COLORS.WHITE,
    width: '80%',
  },
  textBoxPhraseValue: {
    fontSize: 11,
    lineHeight: 15.1,
    marginTop: '3.5%',
    fontFamily: fontFamilies.DefaultBold,
    textTransform: 'uppercase',
    color: theme.COLORS.WHITE,
  },
  textBoxPhraseValueAction: {
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.TULIP_TREE,
  },
  buttonStyle: {
    marginBottom: 16,
    width: '100%',
    borderRadius: 30,
    alignSelf: 'center',
    backgroundColor: theme.APP_COLOR_2,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: fontFamilies.DefaultBold,
    textTransform: 'uppercase',
    textAlignVertical: 'center',
    color: theme.COLORS.WHITE,
    textAlign: 'center',
  },
  addWalletButtonText: {
    fontSize: 18,
    fontFamily: fontFamilies.DefaultBold,
    textTransform: 'uppercase',
    textAlignVertical: 'center',
    color: theme.COLORS.DARK_PURPLE,
  },
  redText: {
    fontSize: 10,
    fontFamily: fontFamilies.DefaultBold,
    textTransform: 'uppercase',
    textAlignVertical: 'center',
    color: theme.COLORS.LIGHT_RED,
  },
  secureFeather: {
    marginTop: 15,
  },
  secureTextRules: {
    fontSize: 11,
    lineHeight: 15.1,
    marginTop: 15,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.WHITE,
  },
});
