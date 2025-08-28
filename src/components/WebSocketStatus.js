import React from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {theme} from '../services/Common/theme';

const WebSocketStatus = ({
  url,
  onConnect,
  onDisconnect,
  isConnected,
  connectionStatus,
  isReconnecting,
  error,
  stats,
  connect,
  disconnect,
}) => {
  const handleConnect = async () => {
    console.log('🔌 [WebSocketStatus] handleConnect() called');
    try {
      console.log('🔌 [WebSocketStatus] Attempting to connect to:', url);
      await connect();
      console.log(
        '🔌 [WebSocketStatus] Connection successful, calling onConnect callback',
      );
      if (onConnect) onConnect();
    } catch (err) {
      console.error('❌ [WebSocketStatus] Connection failed:', err);
      Alert.alert('Connection Error', err.message || 'Failed to connect');
    }
  };

  const handleDisconnect = () => {
    console.log('🔌 [WebSocketStatus] handleDisconnect() called');
    disconnect();
    console.log(
      '🔌 [WebSocketStatus] Disconnected, calling onDisconnect callback',
    );
    if (onDisconnect) onDisconnect();
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return theme.COLORS.SUCCESS || '#4CAF50';
      case 'connecting':
        return theme.COLORS.WARNING || '#FF9800';
      case 'disconnected':
        return theme.COLORS.ERROR || '#F44336';
      case 'failed':
        return theme.COLORS.ERROR || '#F44336';
      default:
        return theme.COLORS.GRAY || '#9E9E9E';
    }
  };

  const getStatusText = () => {
    if (isReconnecting) {
      return `Reconnecting... (${stats.reconnectAttempts || 0}/${
        stats.maxReconnectAttempts || 5
      })`;
    }

    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'failed':
        return 'Connection Failed';
      default:
        return 'Unknown';
    }
  };

  return <></>;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: theme.COLORS.BG,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.TEXT || '#ffffff',
  },
  errorText: {
    color: theme.COLORS.ERROR || '#F44336',
    fontSize: 14,
    marginBottom: 8,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsText: {
    fontSize: 12,
    color: theme.COLORS.GRAY || '#9E9E9E',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: theme.COLORS.SUCCESS || '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: theme.COLORS.ERROR || '#F44336',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WebSocketStatus;
