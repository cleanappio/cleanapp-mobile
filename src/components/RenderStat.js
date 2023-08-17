import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';

const RenderStat = (props) => {
  const {isSelf = false, item, index} = props;

  //const isUser = item && ((item.username && userName === item.username) || (item.address && ( walletAddress === item.address))) &&  !isSelf;

  const bottomMargin = (index === 0 || index === 1) && !isSelf ? 8 : 0;
  let indexColor = 'white',
    indexSize = 12,
    bottomBorderColor = 'transparent',
    borderHeight = 0,
    nameColor = 'white',
    nameSize = 14,
    valueColor = 'white',
    marginBottom = 0,
    valueSize = 14;
  if (isSelf) {
    indexColor = theme.COLORS.TEXT_GREY;
    indexSize = 14;
    nameColor = theme.COLORS.TEXT_GREY;
    nameSize = 14;
    valueColor = theme.COLORS.TEXT_GREY;
  } /* else if(isUser){

        indexColor = theme.COLORS.TULIP_TREE;
        //indexSize = 14;
        nameColor = theme.COLORS.TULIP_TREE;
        //nameSize = 18;
        valueColor = theme.COLORS.TULIP_TREE;
    } */ else {
    switch (index) {
      case 0:
        indexColor = theme.COLORS.GOLD;
        valueColor = theme.COLORS.GOLD;
        bottomBorderColor = theme.COLORS.GOLD;
        borderHeight = 2;
        marginBottom = 8;
        break;
      case 1:
        indexColor = theme.COLORS.SILVER;
        valueColor = theme.COLORS.SILVER;
        bottomBorderColor = theme.COLORS.SILVER;
        borderHeight = 2;
        marginBottom = 8;
        break;
      case 2:
        indexColor = theme.COLORS.BRONZE;
        valueColor = theme.COLORS.BRONZE;
        bottomBorderColor = theme.COLORS.BRONZE;
        borderHeight = 2;
        break;
    }
  }
  return (
    <>
      {item && (
        <View
          style={{
            ...styles.listContainer,
            backgroundColor: index % 2 == 0 ? 'transparent' : theme.APP_COLOR_1,
            bottomMargin: bottomMargin,
            borderBottomColor: bottomBorderColor,
            marginBottom: marginBottom,
          }}>
          <Text
            style={{
              ...styles.rank,
              color: indexColor,
              fontWeight: '300',
              fontSize: indexSize,
              fontFamily: fontFamilies.Default,
            }}>{`${index + 1}${
            index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'
          }`}</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flex: 1,
            }}>
            <Text
              style={{
                ...styles.name,
                color: indexColor,
                fontSize: nameSize,
                width: '60%',
                fontWeight: '300',
                fontFamily: fontFamilies.Default,
                textAlign: isSelf ? 'center' : 'left',
              }}>
              {isSelf
                ? 'You'
                : item.username
                ? item.username
                : item.public_address}
            </Text>
            <Text
              style={{
                ...styles.name,
                color: indexColor,
                fontWeight: '300',
                fontSize: nameSize,
                fontFamily: fontFamilies.Default,
              }}>{`${item.rewards} CATS`}</Text>
          </View>
        </View>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  listContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rank: {
    width: '15%',
    color: theme.COLORS.WHITE,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
  },
  name: {
    marginLeft: 7,
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default RenderStat;
