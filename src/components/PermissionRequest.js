import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import PermissionManager from '../services/PermissionManager';

const PermissionRequest = () => {
  const [permissions, setPermissions] = useState({
    location: {granted: false, reason: ''},
    camera: {granted: false, reason: ''},
    notifications: {granted: false, reason: ''},
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const result = await PermissionManager.checkAllPermissions();
    setPermissions(result);
  };

  const requestPermission = async type => {
    let result;

    switch (type) {
      case 'location':
        result = await PermissionManager.requestLocationPermission();
        break;
      case 'camera':
        result = await PermissionManager.requestCameraPermission();
        break;
      case 'notifications':
        result = await PermissionManager.requestNotificationPermission();
        break;
    }

    if (result.granted) {
      Alert.alert('Success', `${type} permission granted!`);
    } else if (result.reason === 'blocked') {
      Alert.alert(
        'Permission Required',
        `${type} permission is required. Please enable it in Settings.`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Settings', onPress: PermissionManager.openSettings},
        ],
      );
    }

    checkPermissions(); // Refresh permissions
  };

  const renderPermissionButton = (type, permission) => (
    <TouchableOpacity
      style={[
        styles.permissionButton,
        permission.granted && styles.grantedButton,
      ]}
      onPress={() => requestPermission(type)}
      disabled={permission.granted}>
      <Text style={styles.buttonText}>
        {permission.granted ? `${type} Granted` : `Request ${type}`}
      </Text>
    </TouchableOpacity>
  );

  return <></>;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  grantedButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  successText: {
    color: '#34C759',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
});

export default PermissionRequest;
