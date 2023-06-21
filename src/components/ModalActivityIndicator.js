import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';
const logo = require('../assets/icon.png');

const ModalActivityIndicator = (props) => {
  const {modalVisible} = props || {};

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      statusBarTranslucent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Image source={logo} style={styles.logo} resizeMode="stretch" />
          <ActivityIndicator
            size={20}
            style={styles.loading}
            color={theme.COLORS.WHITE}
          />
          <Text style={styles.loadingText}>Please Wait...</Text>
        </View>
      </View>
    </Modal>
  );
};

export default ModalActivityIndicator;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(52,52,52,0.5)',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 60,
  },
  loading: {
    right: 0,
    left: '12%',
    top: '46.5%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.WHITE,
  },
});
