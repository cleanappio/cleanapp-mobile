import React from 'react'
import Svg, { Circle } from "react-native-svg";
import {   PixelRatio,
  StyleSheet, Text, View } from 'react-native';
import { fontFamilies } from '../utils/fontFamilies';

export const AggregatedMarker = ({ count, bgColor, numColor }) => {
  var coeff;
  var style;
  if (count < 10) {
    coeff = 10;
    style = styles.numberTextTiny;
  } else if (count < 100) {
    coeff = 14;
    style = styles.numberTextSmall;
  } else if (count < 500) {
    coeff = 20;
    style = styles.numberTextMedium;
  } else if (count < 1000) {
    coeff = 26;
    style = styles.numberTextLarge;
  } else {
    coeff = 40;
    style = styles.numberTextHuge;
  }
  coeff *= PixelRatio.getFontScale();

  return (
    <Svg
      width={coeff * 2 + 1}
      height={coeff * 2 + 1}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Circle
        cx={coeff}
        cy={coeff}
        r={coeff}
        fill={bgColor}
      />

      <View style={styles.numberContainerHorizontal}>
        <Text style={{color: numColor, ...style}}>{count}</Text>
      </View>
    </Svg>
  );
};

export const styles = StyleSheet.create({
  numberContainerHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  numberTextTiny: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
    textAlign: 'center',
  },
  numberTextSmall: {
    fontSize: 16,
    lineHeight: 28,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
  },
  numberTextMedium: {
    fontSize: 20,
    lineHeight: 36,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
  },
  numberTextLarge: {
    fontSize: 24,
    lineHeight: 48,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
  },
  numberTextHuge: {
    fontSize: 32,
    lineHeight: 80,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
  },
});