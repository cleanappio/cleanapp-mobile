import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../services/Common/theme';
import { fontFamilies } from '../utils/fontFamilies';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';

export const ReferralSharing = ({ isVisible, setIsVisible, refUrl }) => {
  const { t } = useTranslation();

  console.log(refUrl);
  const onShare = () => {
    let shareImage = {
      message: refUrl,
      subject: t('cachescreen.Sharingmyreferralcode'), //string
      title: t('cachescreen.Sharingmyreferralcode'), //string
    };
    Share.open(shareImage)
      .then((res) => { })
      .catch((err) => { });
  };

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
      >
        <SafeAreaView style={{ ...styles.centeredView, ...styles.frameView }}>
          <QRCode
            value={refUrl}
          />
          <View style={{ ...styles.blankCard, marginTop: 8 }}>
            <View style={styles.row}>
              <Text style={styles.txt12italic}>{refUrl}</Text>
              <Pressable style={styles.btnBlack} onPress={onShare}>
                <Text style={styles.txt12}>{ t('referral.share') }</Text>
              </Pressable>
            </View>
          </View>
          <Pressable
            style={styles.btnBlue}
            onPress={() => {
              setIsVisible(false);
            }}>
            <Text style={styles.btnBlueText}>
              {t('referral.close')}
            </Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  blankCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameView: {
    backgroundColor: theme.APP_COLOR_2,
  },
  btnBlue: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 30,
    width: '90%',
  },
  btnBlueText: {
    textAlign: 'center',
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: theme.COLORS.WHITE,
  },
  btnBlack: {
    backgroundColor: theme.APP_COLOR_1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  txt12: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  txt12bold: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
    color: theme.COLORS.TEXT_GREY,
  },
  txt12italic: {
    fontFamily: fontFamilies.DefaultItalic,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  txt12thin: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '300',
    color: theme.COLORS.TEXT_GREY,
  },
  txt12thinitalic: {
    fontFamily: fontFamilies.DefaultItalic,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '300',
    color: theme.COLORS.TEXT_GREY,
  },
  txt16: {
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  txt16bold: {
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: theme.COLORS.TEXT_GREY,
  },
  txt18: {
    fontFamily: fontFamilies.Default,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    color: theme.COLORS.TEXT_GREY,

  },
  txt24: {
    fontFamily: fontFamilies.Default,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  }
})
