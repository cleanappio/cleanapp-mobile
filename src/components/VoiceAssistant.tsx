import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useVoiceSession} from '../hooks/useVoiceSession';

interface VoiceAssistantProps {
  baseURL: string;
  onSessionCreated?: (sessionId: string) => void;
  onError?: (error: string) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  baseURL,
  onSessionCreated,
  onError,
}) => {
  const {
    session,
    isLoading,
    error,
    isConnected,
    createSession,
    checkHealth,
    clearSession,
  } = useVoiceSession({baseURL});

  useEffect(() => {
    // Check health on mount
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    if (session && onSessionCreated) {
      onSessionCreated(session.session_id);
    }
  }, [session, onSessionCreated]);

  const handleCreateSession = async () => {
    try {
      await createSession({
        model: 'gpt-4o-realtime-preview',
        voice: 'alloy', // Optional: specify voice
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create voice session');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Assistant</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text
          style={[
            styles.statusText,
            {color: isConnected ? '#4CAF50' : '#F44336'},
          ]}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>

      {session && (
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionLabel}>Session ID:</Text>
          <Text style={styles.sessionId}>{session.session_id}</Text>
          <Text style={styles.expiresLabel}>
            Expires:{' '}
            {new Date(parseInt(session.expires_at) * 1000).toLocaleString()}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleCreateSession}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Session</Text>
          )}
        </TouchableOpacity>

        {session && (
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearSession}>
            <Text style={styles.buttonText}>Clear Session</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
    color: '#666',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionInfo: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  sessionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  sessionId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 5,
  },
  expiresLabel: {
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#2196F3',
  },
});

export default VoiceAssistant;
