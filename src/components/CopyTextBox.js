import React from 'react';
import {Text, View, ToastAndroid} from 'react-native';
import Ripple from '../components/Ripple';
import Clipboard from '@react-native-clipboard/clipboard';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {fontFamilies} from '../utils/fontFamilies';

const CopyTextBox = ({item}) => {
  const {address = '', value = '', oneLine = false} = item || {};

  const onCopy = () => {
    Clipboard.setString(item);
    ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  };

  return (
    <View
      style={{
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
      }}>
      <Text
        style={{
          fontSize: 12,
          fontFamily: fontFamilies.Default,
          fontWeight: '600',
          color: '#6c6c6c',
        }}>
        {address}
      </Text>
      <View
        style={{
          marginTop: 5,
          marginBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Text
          numberOfLines={oneLine ? 1 : 5}
          style={{
            fontSize: 16,
            width: '80%',
            fontFamily: fontFamilies.Default,
          }}>
          {value}
        </Text>
        <Ripple
          onPress={onCopy}
          outerStyle={{borderRadius: 10, flex: 1, alignItems: 'flex-end'}}
          innerStyle={{padding: 10}}>
          <MaterialIcon size={20} name="content-copy" color="#6c6c6c" />
        </Ripple>
      </View>
    </View>
  );
};

export default CopyTextBox;
