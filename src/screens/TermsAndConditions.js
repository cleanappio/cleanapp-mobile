import React, { useTransition } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../services/Common/theme';
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';
import { fontFamilies } from '../utils/fontFamilies';
import { useTranslation } from 'react-i18next';
import HTMLView from 'react-native-htmlview';

export const TermsAndConditions = ({ isVisible, setIsVisible }) => {
  const { t } = useTranslation();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
    >
      <SafeAreaView style={styles.frameView} edges={['top', 'left', 'right', 'bottom']}>
        <GestureHandlerRootView>
          <ScrollView style={styles.contentView}>
            <HTMLView style={styles.contentText} value={t('privacy.content')} />
          </ScrollView>
        </GestureHandlerRootView>
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
  );
}

const styles = StyleSheet.create({
  frameView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
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
