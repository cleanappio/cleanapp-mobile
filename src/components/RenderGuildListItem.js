import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';
import Ripple from './Ripple';
import {Row} from './Row';

const RenderGuildListItem = (props) => {
  const {
    isSelf = false,
    item,
    index,
    selectedId = null,
    isRank = true,
    onToggle = () => {},
    joinGuild = () => {},
  } = props;

  const selected = selectedId === item._id;

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
  } else {
    if (isRank) {
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
  }
  return (
    <>
      {item && (
        <Ripple
          style={{
            width: '100%',
            backgroundColor:
              index % 2 === 0 ? 'transparent' : theme.APP_COLOR_1,
            bottomMargin: bottomMargin,
            borderBottomColor: bottomBorderColor,
            marginBottom: marginBottom,
            paddingHorizontal: 24,
            paddingVertical: 16,
          }}
          onPress={() => onToggle(item._id)}>
          <View style={styles.listContainer}>
            <Text
              style={{
                ...styles.rank,
                color: indexColor,
                fontWeight: '300',
                fontSize: indexSize,
                fontFamily: fontFamilies.Default,
              }}>{`${index + 1}${
              index === 0
                ? 'st'
                : index === 1
                ? 'nd'
                : index === 2
                ? 'rd'
                : 'th'
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
                  width: isRank ? '60%' : '100%',
                  fontWeight: '300',
                  fontFamily: fontFamilies.Default,
                  textAlign: isRank ? 'left' : 'right',
                }}>
                {item.name}
              </Text>
              {isRank && (
                <Text
                  style={{
                    ...styles.name,
                    color: indexColor,
                    fontWeight: '300',
                    fontSize: nameSize,
                    fontFamily: fontFamilies.Default,
                  }}>{`${item.rewards} CATS`}</Text>
              )}
            </View>
          </View>
          {selected && (
            <View style={{marginTop: 16}}>
              <Text style={styles.txt12italic}>{item.description}</Text>
              <Row style={{marginTop: 16}}>
                <Text style={styles.txt12}>{`${item.rewards} CATS`}</Text>
                <Text
                  style={styles.txt12}>{`${item.members.length} Members`}</Text>
                <Ripple
                  onPress={() => joinGuild(item._id)}
                  containerStyle={{...styles.btnContainerSmall}}
                  style={{...styles.btnSmall}}>
                  <Text style={styles.btnText}>{'Join'}</Text>
                </Ripple>
              </Row>
            </View>
          )}
        </Ripple>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  listContainer: {
    flexDirection: 'row',
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
  txt12: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    fontWeight: '300',
    lineHeight: 20,
  },
  txt12italic: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.DefaultItalic,
    fontSize: 12,
    fontWeight: '300',
    lineHeight: 20,
  },
  btnContainerSmall: {
    backgroundColor: theme.COLORS.BTN_LIGHTE_GREY,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.BTN_BG_BLUE,
  },
  btnSmall: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  btnText: {
    color: theme.COLORS.BTN_BG_BLUE,
  },
});

export default RenderGuildListItem;
