import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import WebSocketMessages from '../components/WebSocketMessages';
import WebSocketStatus from '../components/WebSocketStatus';
import {useWebSocket} from '../hooks/useWebSocket';
import {theme} from '../services/Common/theme';

const WebSocketDemoScreen = () => {
  const [serverUrl, setServerUrl] = useState(
    'wss://live.cleanapp.io/api/v3/reports/listen',
  );
  const [messageTypes, setMessageTypes] = useState([
    'chat',
    'notification',
    'update',
  ]);
  const [customMessageType, setCustomMessageType] = useState('');

  // Render counter removed - was causing noise in logs

  // Stabilize messageTypes array to prevent unnecessary re-renders
  const stableMessageTypes = useMemo(() => messageTypes, [messageTypes]);

  // Centralized WebSocket connection
  const {
    connectionStatus,
    isConnected,
    isReconnecting,
    error,
    stats,
    connect,
    disconnect,
    subscribe: originalSubscribe,
    unsubscribe: originalUnsubscribe,
  } = useWebSocket(serverUrl, {
    autoConnect: false,
    reconnect: true,
    heartbeat: false, // Go backend handles ping/pong
  });

  useEffect(() => {
    connect();
  }, []);

  // Stabilize function references to prevent unnecessary re-renders
  const subscribe = useCallback(originalSubscribe, [originalSubscribe]);
  const unsubscribe = useCallback(originalUnsubscribe, [originalUnsubscribe]);

  const handleConnect = () => {
    console.log('🖥️ [WebSocketDemoScreen] handleConnect() called');
    console.log('🖥️ [WebSocketDemoScreen] Server URL:', serverUrl);
  };

  const handleDisconnect = () => {
    console.log('🖥️ [WebSocketDemoScreen] handleDisconnect() called');
    console.log('🖥️ [WebSocketDemoScreen] Server URL:', serverUrl);
  };

  const addMessageType = () => {
    if (
      customMessageType.trim() &&
      !messageTypes.includes(customMessageType.trim())
    ) {
      setMessageTypes([...messageTypes, customMessageType.trim()]);
      setCustomMessageType('');
    }
  };

  const removeMessageType = typeToRemove => {
    Alert.alert(
      'Remove Message Type',
      `Are you sure you want to remove "${typeToRemove}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMessageTypes(messageTypes.filter(type => type !== typeToRemove));
          },
        },
      ],
    );
  };

  const resetToDefaults = () => {
    setMessageTypes(['chat', 'notification', 'update']);
    setServerUrl(Constants.expoConfig?.extra?.devWebsocketUrl);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* WebSocket Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Status</Text>
          <WebSocketStatus
            url={serverUrl}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isConnected={isConnected}
            connectionStatus={connectionStatus}
            isReconnecting={isReconnecting}
            error={error}
            stats={stats}
            connect={connect}
            disconnect={disconnect}
          />
        </View>

        {/* WebSocket Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Real-time Messages</Text>
          <WebSocketMessages
            url={serverUrl}
            messageTypes={stableMessageTypes}
            isConnected={isConnected}
            subscribe={subscribe}
            unsubscribe={unsubscribe}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.BG || '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: theme.COLORS.PRIMARY || '#2196F3',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.COLORS.TEXT || '#333333',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.COLORS.TEXT || '#333333',
    marginRight: 12,
    minWidth: 80,
  },
  urlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.COLORS.BORDER || '#E0E0E0',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: theme.COLORS.TEXT || '#333333',
  },
  resetButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.COLORS.GRAY || '#9E9E9E',
    borderRadius: 4,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  messageTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  messageTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.PRIMARY || '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  messageTypeText: {
    fontSize: 12,
    color: theme.COLORS.PRIMARY || '#1976D2',
    fontWeight: '500',
    marginRight: 6,
  },
  removeTypeButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.COLORS.ERROR || '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeTypeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  addTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTypeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.COLORS.BORDER || '#E0E0E0',
    borderRadius: 6,
    padding: 12,
    marginRight: 8,
    fontSize: 14,
    color: theme.COLORS.TEXT || '#333333',
  },
  addTypeButton: {
    backgroundColor: theme.COLORS.SUCCESS || '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  addTypeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.COLORS.PRIMARY || '#2196F3',
    marginRight: 12,
    minWidth: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: theme.COLORS.TEXT || '#333333',
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: theme.COLORS.TEXT || '#333333',
    lineHeight: 20,
  },
});

export default WebSocketDemoScreen;
