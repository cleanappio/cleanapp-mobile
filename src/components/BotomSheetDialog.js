import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';
import Ripple from './Ripple';
import CloseIcon from '../assets/ico_close.svg';
import {BottomSheet} from 'react-native-elements';

const BottomSheetDialog = ({
  isVisible = false,
  onClose = () => {},
  title = '',
  headerIcon = null,
  children,
}) => {
  return (
    <BottomSheet
      overlayColor={theme.COLORS.BLACK}
      overlayOpacity={0.5}
      containerStyle={styles.container}
      isVisible={isVisible}>
      <View style={styles.sheetContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          {headerIcon ? (
            <>{headerIcon}</>
          ) : (
            <Ripple onPress={onClose}>
              <CloseIcon />
            </Ripple>
          )}
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.BLACK_OPACITY_90P,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: theme.APP_COLOR_1,
    paddingVertical: 22,
    paddingHorizontal: 16,
    zIndex: 999,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
    color: theme.COLORS.TEXT_GREY,
  },
  content: {},
});

export default BottomSheetDialog;
