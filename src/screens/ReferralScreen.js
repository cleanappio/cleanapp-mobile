import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateReferralUrl } from '../functions/referral';
import { theme } from '../services/Common/theme';
import { fontFamilies } from '../utils/fontFamilies';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';

const ReferralScreen = (props) => {
  const { t } = useTranslation();
  const [refUrl, setRefUrl] = useState("No refurl");

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

  useFocusEffect(
    React.useCallback(() => {
      generateReferralUrl().then((url) => {
        if (url) {
          setRefUrl(url);
        }
      });
    }, [])
  );

  return (
    <SafeAreaView style={styles.centeredView} edges={['top', 'left', 'right']}>
      <View style={styles.centeredView}>
        <View style={{...styles.row, marginTop: 30, marginHorizontal: 30}}>
          <Text style={styles.txt24}>{t('referral.title')}</Text>
        </View>
        <View style={{...styles.row, marginTop: 20, marginHorizontal: 30}}>
          <Text style={styles.txt18}>{t('referral.content')}</Text>
        </View>
        <View style={{ ...styles.row, marginTop: 20 }}>
          <QRCode
            size={250}
            value={refUrl}
            color={theme.COLORS.BLACK}
            backgroundColor={theme.COLORS.WHITE}
            quietZone={5}
          />
        </View>
        <View style={{ ...styles.row, marginTop: 20 }}>
          <Text style={styles.txt14}>{refUrl}</Text>
        </View>
        <View style={{ ...styles.row, marginTop: 20 }}>
          <Pressable
            style={{ ...styles.btnBlue, width: 300 }}
            onPress={onShare}
          >
            <Text style={styles.btnBlueText}>{t('referral.share')}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
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
    // justifyContent: 'center',
    alignItems: 'center',
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
  txt18: {
    fontFamily: fontFamilies.Default,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  txt24: {
    fontFamily: fontFamilies.Default,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '500',
    color: theme.COLORS.TEXT_GREY,
  },
})

export default ReferralScreen