import React from 'react';
import {ActivityIndicator, Modal, StyleSheet, View} from 'react-native';
import {theme} from '../services/Common/theme';

export const InProgress = ({isVisible}) => {
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        >
        <View style={{...styles.centeredView, ...styles.overlapView}}>
          <ActivityIndicator
            size={70}
            color={theme.COLORS.WHITE}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlapView: {
    opacity: 0.5,
    backgroundColor: 'black',
  },
})

