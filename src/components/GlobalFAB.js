import React from 'react';
import {View, StyleSheet} from 'react-native';
import FloatingActionButton from './FloatingActionButton';
import {useFAB} from '../hooks/useFAB';
import {useNavigation} from '@react-navigation/native';

// Import icons - you can replace these with your preferred icon library
// import CameraIcon from '../assets/ico_camera.svg';

const GlobalFAB = () => {
  const {fabShow} = useFAB();
  const navigation = useNavigation();

  const handleFABPress = () => {
    // Navigate to camera screen or perform main action
    // navigation.navigate('Camera');
    const baseUrl = `https://devvoice.cleanapp.io/`;
    
  };

  // You can customize this based on your needs
  if (!fabShow) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FloatingActionButton
        onPress={handleFABPress}
        text="+"
        position="bottom-right"
        size="large"
        color="#007AFF"
        style={styles.fab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  fab: {
    // Additional custom styles if needed
  },
});

export default GlobalFAB;
