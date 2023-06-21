import React from 'react';
import {ToastAndroid, Alert, Platform} from 'react-native';
import Ripple from '../components/Ripple';
import {theme} from '../services/Common/theme';
import Clipboard from '@react-native-clipboard/clipboard';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

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
      <MaterialIcon
        size={15}
        name="content-copy"
        color={theme.COLORS.TULIP_TREE}
      />
    </Ripple>
  );
};

export default CButton;
