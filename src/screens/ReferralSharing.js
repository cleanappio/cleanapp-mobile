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
        statusBarTranslucent={true}
      >
        <SafeAreaView style={{ backgroundColor: theme.COLORS.BLACK_OPACITY_67P, flex: 0.53 }} />
        <SafeAreaView style={{ ...styles.centeredView, ...styles.frameView, flex: 0.47 }}>
          <View style={{ ...styles.row, marginTop: 6 }}>
            <QRCode
              value={refUrl}
              color={theme.COLORS.BLACK}
              backgroundColor={theme.COLORS.WHITE}
              quietZone={3}
            />
          </View>
          <View style={{ ...styles.row, marginTop: 6 }}>
            <Text style={styles.txt14}>{refUrl}</Text>
          </View>
          <View style={{ ...styles.row, marginTop: 18 }}>
            <Pressable
              style={{ ...styles.btnBlue, width: '80%' }}
              onPress={onShare}
            >
              <Text style={styles.btnBlueText}>{t('referral.share')}</Text>
            </Pressable>
          </View>
          <View style={{ ...styles.row, marginTop: 14 }}>
            <Pressable
              style={{ ...styles.btnBlack, width: '80%' }}
              onPress={() => {
                setIsVisible(false);
              }}>
              <Text style={styles.btnBlueText}>
                {t('referral.close')}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameView: {
    backgroundColor: theme.APP_COLOR_1,
  },
  btnBlue: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    borderRadius: 8,
    paddingVertical: 8,
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
    backgroundColor: theme.COLORS.BG,
    borderRadius: 8,
    paddingVertical: 8,
  },
  txt14: {
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
})
