import React from 'react';
import {View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import {fontFamilies} from '../utils/fontFamilies';

const Tag = ({
  title = '',
  onRemove = null,
  backgroundColor = '#E3E7FF',
  textColor = '#4E9CF9',
  iconColor = '#4E9CF9',
}) => {
  return (
    <TouchableWithoutFeedback onPress={onRemove}>
      <View style={[styles.container, {backgroundColor: backgroundColor}]}>
        {onRemove ? (
          <Text style={{fontSize: 12, color: iconColor}} onPress={onRemove}>
            ✕
          </Text>
        ) : null}
        <Text style={[styles.tagText, {color: textColor}]}>{title}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Tag;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginRight: 8,
    borderRadius: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 10,
    marginLeft: 3,
    lineHeight: 12,
    fontFamily: fontFamilies.DefaultBold,
    textTransform: 'uppercase',
  },
});
