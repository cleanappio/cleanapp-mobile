import React from 'react';
import {StyleSheet, View} from 'react-native';

export const Row = ({
  style = {},
  justifyContent = 'space-between',
  children,
}) => {
  return (
    <View
      style={{
        ...styles.row,
        ...style,
        justifyContent: justifyContent,
      }}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
