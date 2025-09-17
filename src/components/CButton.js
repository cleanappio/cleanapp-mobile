import React from 'react';
import {ToastAndroid, Alert, Platform} from 'react-native';
import Ripple from '../components/Ripple';
import {theme} from '../services/Common/theme';
import Clipboard from '@react-native-clipboard/clipboard';

const CButton = ({text, onCopied = () => {}}) => {
  const onCopy = () => {
    onCopied();
    Clipboard.setString(text);
    if (Platform.OS === 'ios') {
      Alert.alert('Copied to clipboard');
    } else {
      ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
    }
  };

  return (
    <Ripple onPress={onCopy}>
      <Text style={{fontSize: 15, color: theme.COLORS.TULIP_TREE}}>📋</Text>
    </Ripple>
  );
};

export default CButton;
