import React from 'react';
import {View, TextInput as TI, StyleSheet, Text, Platform} from 'react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';

const TextInput = ({
  isTextArea = false,
  placeholder = '',
  value = '',
  label = '',
  onChangeText = '',
  ...props
}) => {
  return (
    <View style={styles.container}>
      {!isTextArea ? (
        <TI
          value={value}
          style={styles.inputSingleline}
          placeholder={placeholder}
          onChangeText={onChangeText}
          {...props}
        />
      ) : (
        <>
          <Text style={styles.label}>{label}</Text>
          <TI
            multiline
            value={value}
            style={styles.inputMultiline}
            placeholder={placeholder}
            onChangeText={(val) => onChangeText(val.toUpperCase())}
            {...props}
          />
        </>
      )}
    </View>
  );
};

export default TextInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderColor: theme.COLORS.BLUE,
  },
  label: {
    fontSize: 10,
    lineHeight: 12,
    color: theme.COLORS.WHITE,
    textTransform: 'uppercase',
    fontFamily: fontFamilies.Default,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
  },
  inputSingleline: {
    color: theme.COLORS.WHITE,
  },
  inputMultiline: {
    padding: 0,
    fontSize: 11,
    minHeight: 95,
    maxHeight: 95,
    marginTop: 10,
    lineHeight: 16,
    textAlignVertical: 'top',
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
  },
});
