import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../services/Common/theme';
import { fontFamilies } from '../utils/fontFamilies';
import LinearGradient from 'react-native-linear-gradient';

const RenderStat = (props) => {
  const { item } = props;

  //const isUser = item && ((item.username && userName === item.username) || (item.address && ( walletAddress === item.address))) &&  !isSelf;

  const bottomMargin = (item.place === 1 || item.place === 2) && !item.is_you ? 8 : 0;
  let indexColor = 'white',
    indexSize = 12,
    bottomBorderColor = 'transparent',
    borderHeight = 0,
    nameColor = 'white',
    nameSize = 14,
    valueColor = 'white',
    marginBottom = 0,
    valueSize = 14;
  if (item.is_you) {
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
    switch (item.place) {
      case 1:
        indexColor = theme.COLORS.GOLD;
        valueColor = theme.COLORS.GOLD;
        bottomBorderColor = theme.COLORS.GOLD;
        borderHeight = 2;
        marginBottom = 8;
        break;
      case 2:
        indexColor = theme.COLORS.SILVER;
        valueColor = theme.COLORS.SILVER;
        bottomBorderColor = theme.COLORS.SILVER;
        borderHeight = 2;
        marginBottom = 8;
        break;
      case 3:
        indexColor = theme.COLORS.BRONZE;
        valueColor = theme.COLORS.BRONZE;
        bottomBorderColor = theme.COLORS.BRONZE;
        borderHeight = 2;
        break;
    }
  }
  return (
    <>
      {item && item.is_you && (
        <View
          style={{
            width: '100%',
          }}>
          <LinearGradient
            end={{ x: 0, y: 0.5 }}
            start={{ x: 1, y: 0.5 }}
            colors={[
              theme.COLORS.GREEN_ITEM_BG_END,
              theme.COLORS.GREEN_ITEM_BG_START,
              theme.COLORS.GREEN_ITEM_BG_END,
            ]}
            style={{
              width: '100%',
              height: 1,
            }}
          />
        </View>
      )}
      {item && (
        <View
          style={{
            ...styles.listContainer,
            backgroundColor: item.place % 2 == 1 ? 'transparent' : theme.APP_COLOR_1,
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
            }}>{`${item.place}${item.place === 1 ? 'st' : item.place === 2 ? 'nd' : item.place === 3 ? 'rd' : 'th'
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
                textAlign: item.is_you ? 'center' : 'left',
              }}>
              {item.is_you
                ? item.title + ' (You)'
                : item.title}
            </Text>
            <Text
              style={{
                ...styles.name,
                color: indexColor,
                fontWeight: '300',
                fontSize: nameSize,
                fontFamily: fontFamilies.Default,
              }}>{`${item.kitn} KITN`}</Text>
          </View>
        </View>
      )}
      {item && item.is_you && (
        <View
          style={{
            width: '100%',
          }}>
          <LinearGradient
            end={{ x: 0, y: 0.5 }}
            start={{ x: 1, y: 0.5 }}
            colors={[
              theme.COLORS.GREEN_ITEM_BG_END,
              theme.COLORS.GREEN_ITEM_BG_START,
              theme.COLORS.GREEN_ITEM_BG_END,
            ]}
            style={{
              width: '100%',
              height: 1,
            }}
          />
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
