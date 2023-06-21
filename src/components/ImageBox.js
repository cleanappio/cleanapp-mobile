import React from 'react';
import {Text, View, Image, Platform} from 'react-native';
import Ripple from './Ripple';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Permissions from 'react-native-permissions';
import {useNavigation} from '@react-navigation/native';
import PropTypes from 'prop-types';

const ImageBox = (props) => {
  const {
    label = '',
    onSelect = () => {},
    onRemove = () => {},
    selected = '',
    icon = null,
    height = 150,
    editable = true,
  } = props || {};
  const navigation = useNavigation();
  const takePicture = async () => {
    if (Platform.OS === 'ios') {
      const cameraPermission = await Permissions.request(
        'ios.permission.CAMERA',
      );
      const photoLibraryPermission = await Permissions.request(
        'ios.permission.PHOTO_LIBRARY',
      );
      if (
        cameraPermission === 'granted' &&
        photoLibraryPermission === 'granted'
      ) {
        chooseImage();
      }
    } else {
      const cameraPermission = await Permissions.request(
        'android.permission.CAMERA',
      );
      const storagePermission = await Permissions.request(
        'android.permission.READ_EXTERNAL_STORAGE',
      );
      if (cameraPermission === 'granted' && storagePermission === 'granted') {
        chooseImage();
      }
    }
  };

  const chooseImage = () => {
    navigation.navigate('TakePicture', {
      setImage: async (capturedImage = null) => {
        if (capturedImage) {
          onSelect(capturedImage);
        }
      },
    });
  };

  return (
    <View
      style={{
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 5,
        elevation: 5,
        shadowRadius: 2,
        shadowOpacity: 0.3,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        marginVertical: 5,
      }}>
      {selected ? (
        <>
          {editable ? (
            <Ripple
              outerStyle={{
                backgroundColor: '#fff',
                borderRadius: 25,
                position: 'absolute',
                flexDirection: 'row',
                justifyContent: 'space-between',
                top: '1.5%',
                right: '1.5%',
                zIndex: 1,
              }}
              innerStyle={{
                padding: 5,
              }}
              onPress={onRemove}>
              <FontistoIcon name="close" size={20} color="#000" />
            </Ripple>
          ) : null}
          <Image
            style={{
              height: height,
              width: '100%',
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
            }}
            resizeMode="stretch"
            source={
              selected && (selected.uri || selected.remote)
                ? {uri: selected.uri || selected.remote}
                : require('../assets/userAvator.png')
            }
          />
          <Text
            style={{
              color: '#000',
              paddingHorizontal: '2%',
              paddingVertical: '1%',
            }}
            numberOfLines={1}>
            {label}
          </Text>
        </>
      ) : (
        <Ripple
          outerStyle={{borderRadius: 5}}
          innerStyle={{
            height: 55,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          disabled={!editable}
          onPress={takePicture}>
          <View
            style={{
              width: icon ? '85%' : '100%',
              paddingHorizontal: '5%',
              justifyContent: 'center',
            }}>
            <Text numberOfLines={1}>{`Upload ${label}`}</Text>
          </View>
          {icon ? <View style={{width: '15%'}}>{icon}</View> : null}
        </Ripple>
      )}
    </View>
  );
};

ImageBox.propTypes = {
  label: PropTypes.string,
  onRemove: PropTypes.func,
  selected: PropTypes.object,
  icon: PropTypes.node,
  height: PropTypes.number,
  editable: PropTypes.bool,
};

export default ImageBox;
