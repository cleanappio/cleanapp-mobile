import React, { useTransition } from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {theme} from '../services/Common/theme';
import {ScrollView} from 'react-native-gesture-handler';
import {fontFamilies} from '../utils/fontFamilies';
import {useTranslation} from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import HTMLView from 'react-native-htmlview';

export const TermsAndConditions = ({isVisible, setIsVisible}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        >
        <SafeAreaView style={{...styles.centeredView, ...styles.frameView}}>
          <ScrollView style={styles.contentView}>
            <HTMLView style={styles.contentText} value={t('privacy.content')} />
          </ScrollView>
          <Pressable
            style={styles.btn}
            onPress={() => {
              setIsVisible(false);
            }}>
            <Text style={styles.btnText}>
              {t('onboarding.close')}
            </Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameView: {
    backgroundColor: theme.APP_COLOR_2,
  },
  contentView: {
    width: '90%',
    backgroundColor: theme.COLORS.WHITE,
    padding: 10,
  },
  btn: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 30,
    width: '90%',
  },
  btnText: {
    textAlign: 'center',
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: theme.COLORS.WHITE,
  }
})
