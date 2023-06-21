import {StyleSheet, Dimensions, Platform} from 'react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '5.5%',
    paddingHorizontal: '4.2%',
  },
  contentContainer: {
    paddingBottom: '10%',
  },
  quicraContainer: {
    paddingLeft: 10,
    marginVertical: 9,
    paddingVertical: 10,
  },
  orthcoinText: {
    fontSize: 27,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.WHITE,
  },
  oceanPortfolioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  oceanText: {
    fontSize: 20,
    marginTop: 7,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.TULIP_TREE,
  },
  usdText: {
    fontSize: 12,
    marginTop: 6,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.WHITE,
  },
  menuTriggerContainer: {
    overflow: 'hidden',
  },
  menuTrigger: {
    borderRadius: 8,
    paddingVertical: 11,
    flexDirection: 'row',
    paddingHorizontal: 14,
    backgroundColor: theme.APP_COLOR_2,
  },
  menuOptionsContainer: {
    borderRadius: 8,
    backgroundColor: theme.APP_COLOR_2,
    width: Dimensions.get('screen').width * 0.4,
  },
  menuOption: {
    paddingVertical: 21,
    alignItems: 'center',
    paddingHorizontal: '7%',
    justifyContent: 'center',
  },
  menuOptionDivider: {
    height: 2,
    width: '100%',
    backgroundColor: theme.APP_COLOR_1,
  },
  portfolioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioText: {
    fontSize: 16,
    color: theme.COLORS.WHITE,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
  },
  percentText: {
    fontSize: 20,
    color: theme.COLORS.SUCCESS_COLOR,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  percentTextDanger: {
    fontSize: 20,
    color: theme.COLORS.MATRIX,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  sendAmountDollarText: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: -15,
    textAlign: 'right',
    color: theme.COLORS.WHITE,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
  },
  sendAmountInputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 10,
    borderColor: theme.COLORS.TULIP_TREE,
  },
  inputLabel: {
    fontSize: 10,
    lineHeight: 11.5,
    fontFamily: fontFamilies.DefaultBold,
    textTransform: 'uppercase',
    color: theme.COLORS.WHITE,
  },
  input: {
    padding: 0,
    marginTop: 11,
    lineHeight: 15.1,
    fontFamily: fontFamilies.DefaultLight,
    color: theme.COLORS.WHITE,
  },
  inputDivider: {
    height: 1,
    marginVertical: 18,
    backgroundColor: theme.COLORS.TULIP_TREE,
  },
  mainDivider: {
    height: 2,
    marginVertical: 28,
    marginHorizontal: -15,
    backgroundColor: theme.APP_COLOR_2,
  },
  buttonStyle: {
    width: 138,
    marginTop: 21,
    borderRadius: 30,
    alignSelf: 'flex-end',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.WHITE,
    textTransform: 'uppercase',
    textAlignVertical: 'center',
  },
  stakeUnstakeContainer: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: theme.COLORS.TULIP_TREE,
  },
  stakeAmountDollarText: {
    fontSize: 12,
    marginTop: 40,
    textAlign: 'right',
    color: theme.COLORS.WHITE,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
  },
  stakeUnstakeButtons: {
    marginTop: 21,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stakeUnstakeButtonStyle: {
    borderRadius: 30,
    width: Dimensions.get('screen').width * 0.44,
  },
  stakeButtonText: {
    fontSize: 18,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.WHITE,
    textTransform: 'uppercase',
    textAlignVertical: 'center',
  },
  unstakeButtonText: {
    fontSize: 18,
    fontFamily: fontFamilies.DefaultBold,
    textTransform: 'uppercase',
    textAlignVertical: 'center',
    color: theme.COLORS.LIGHT_RED,
  },
});
