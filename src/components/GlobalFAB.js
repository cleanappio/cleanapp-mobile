import React from 'react';
import {View, StyleSheet} from 'react-native';
import FloatingActionButton from './FloatingActionButton';
import {useFAB} from '../hooks/useFAB';
// import {useNavigation} from '@react-navigation/native';
import ErrorBoundary from './ErrorBoundary';
import MicrophoneIcon from './MicrophoneIcon';

const GlobalFAB = () => {
  const {fabShow} = useFAB();
  // const navigation = useNavigation();

  console.log('GlobalFAB rendering, fabShow:', fabShow);

  const handleFABPress = () => {
    console.log('FAB pressed - starting handler');

    try {
      // TODO: Implement main action
    } catch (error) {
      console.error('Something went wrong:', error);
    }
  };

  // You can customize this based on your needs
  if (!fabShow) {
    return null;
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <FloatingActionButton
          onPress={handleFABPress}
          icon={<MicrophoneIcon width={24} height={24} />}
          position="center-center"
          size="large"
          color="#007AFF"
          style={styles.fab}
        />
      </View>
    </ErrorBoundary>
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
