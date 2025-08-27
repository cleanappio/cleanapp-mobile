import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import PermissionManager from '../services/PermissionManager';

const PermissionTest = () => {
  const [permissions, setPermissions] = useState({
    location: {granted: false, reason: ''},
    camera: {granted: false, reason: ''},
    notifications: {granted: false, reason: ''},
  });

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    try {
      const result = await PermissionManager.checkAllPermissions();
      setPermissions(result);
      console.log('Permission check result:', result);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const initializeNotifications = async () => {
    try {
      const result = await PermissionManager.initializeNotifications();
      console.log('Notification initialization result:', result);
      checkAllPermissions(); // Refresh permissions after initialization
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const requestSpecificPermission = async type => {
    try {
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

      console.log(`${type} permission result:`, result);

      if (result.granted) {
        Alert.alert('Success', `${type} permission granted!`);
      } else {
        Alert.alert('Permission Result', `${type}: ${result.reason}`, [
          {text: 'OK', style: 'default'},
          ...(result.reason === 'blocked'
            ? [{text: 'Settings', onPress: PermissionManager.openSettings}]
            : []),
        ]);
      }

      // Refresh permissions
      checkAllPermissions();
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      Alert.alert('Error', `Failed to request ${type} permission`);
    }
  };

  const getPermissionStatus = permission => {
    if (permission.granted) return '✅ Granted';
    if (permission.reason === 'blocked') return '🚫 Blocked';
    if (permission.reason === 'denied') return '❌ Denied';
    if (permission.reason === 'unavailable') return '⚠️ Unavailable';
    return `❓ ${permission.reason}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permission Test</Text>
      <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>

      <View style={styles.permissionSection}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.statusText}>
          {getPermissionStatus(permissions.location)}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => requestSpecificPermission('location')}>
          <Text style={styles.buttonText}>Request Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.permissionSection}>
        <Text style={styles.sectionTitle}>Camera</Text>
        <Text style={styles.statusText}>
          {getPermissionStatus(permissions.camera)}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => requestSpecificPermission('camera')}>
          <Text style={styles.buttonText}>Request Camera</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.permissionSection}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.statusText}>
          {getPermissionStatus(permissions.notifications)}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => requestSpecificPermission('notifications')}>
          <Text style={styles.buttonText}>Request Notifications</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.refreshButton]}
        onPress={checkAllPermissions}>
        <Text style={styles.buttonText}>Refresh All</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.settingsButton]}
        onPress={PermissionManager.openSettings}>
        <Text style={styles.buttonText}>Open Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.initButton]}
        onPress={initializeNotifications}>
        <Text style={styles.buttonText}>Initialize Notifications</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  permissionSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#34C759',
    marginTop: 10,
  },
  settingsButton: {
    backgroundColor: '#FF9500',
    marginTop: 10,
  },
  initButton: {
    backgroundColor: '#AF52DE',
    marginTop: 10,
  },
});

export default PermissionTest;
