import React, {useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useOpenAIRealtime} from '../hooks/useOpenAIRealtime';
import RTCAudioPlayer from './RTCAudioPlayer';
import MicrophoneIcon from './MicrophoneIcon';
import AudioVisualizer from './AudioVisualizer';
import {theme} from '../services/Common/theme';
import {getUrls} from '../services/API/Settings';

const OpenAIRealtime: React.FC = () => {
  const {
    // Session state
    session,
    isLoading: sessionLoading,
    error: sessionError,
    isConnected: sessionConnected,

    // Realtime state
    isConnected: realtimeConnected,
    isConnecting: realtimeConnecting,
    error: realtimeError,
    localStream,
    remoteStream,

    // Methods
    createSession,
    startConnection,
    stopConnection,
    checkConnectionHealth,

    // Computed
    canStartConnection,
    canStopConnection,
  } = useOpenAIRealtime({
    baseURL: `${getUrls()?.voiceUrl}`,
    autoRetry: true,
    maxRetries: 3,
  });

  // Auto-create session on mount
  useEffect(() => {
    if (!session && !sessionLoading) {
      createSession();
    }
  }, [session, sessionLoading, createSession]);

  useEffect(() => {
    startConnection();
  }, []);

  // Monitor connection state changes
  useEffect(() => {
    if (realtimeConnected) {
      console.log('✅ WebRTC connection established!');
    } else if (realtimeError && !realtimeConnecting) {
      console.log('❌ WebRTC connection failed:', realtimeError);
      Alert.alert('Connection Error', realtimeError);
    }
  }, [realtimeConnected, realtimeError, realtimeConnecting]);

  // Monitor remote stream changes
  useEffect(() => {
    if (remoteStream) {
      console.log('🎵 Remote stream received in component:', remoteStream);
      console.log('🎵 Remote stream tracks:', remoteStream.getTracks());
    }
  }, [remoteStream]);

  const handleStartConnection = async () => {
    try {
      console.log('Starting connection...');
      await startConnection();
      console.log('Connection started, waiting for WebRTC to establish...');
      // Don't show success alert immediately - wait for actual connection
    } catch (error: unknown) {
      console.error('Connection failed:', error);
      Alert.alert(
        'Error',
        `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  const handleStopConnection = () => {
    stopConnection();
  };

  const handleCheckHealth = async () => {
    const isHealthy = await checkConnectionHealth();
    Alert.alert(
      'Health Check',
      isHealthy ? 'Connection is healthy' : 'Connection is unhealthy',
    );
  };

  const handlePress = () => {
    console.log('handlePress');
    if (sessionError) {
      console.log('Session error, returning');
      return;
    }

    if (realtimeError) {
      console.log('Realtime error, returning');
      return;
    }

    console.log('No error, realtimeConnected', realtimeConnected);

    if (realtimeConnected) {
      console.log('Stopping connection');
      handleStopConnection();
      return;
    }

    console.log('Starting connection');
    handleStartConnection();
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View
        style={{
          width: 60,
          height: 60,
          backgroundColor: realtimeError ? '#FF000066' : theme.COLORS.BLACK,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {/* Hidden audio player for remote stream */}
        <RTCAudioPlayer stream={remoteStream} />

        {realtimeConnecting && (
          <ActivityIndicator size="small" color={theme.COLORS.WHITE} />
        )}

        <AudioVisualizer
          isActive={realtimeConnected}
          isConnected={realtimeConnected}
          size={24}
          barCount={5}
          color={
            realtimeError
              ? theme.COLORS.ERROR_COLOR
              : theme.COLORS.GREEN_ITEM_BG_START
          }
          inactiveColor={theme.COLORS.TEXT_GREY_50P}
        />

        {!realtimeConnecting && !realtimeConnected && (
          <MicrophoneIcon
            width={24}
            height={24}
            color={
              realtimeError
                ? theme.COLORS.ERROR_COLOR
                : realtimeConnected
                  ? theme.COLORS.GREEN_ITEM_BG_START
                  : theme.COLORS.WHITE
            }
          />
        )}
      </View>
    </TouchableOpacity>
  );

  // Debug UI
  //   return (
  //     <View style={styles.container}>
  //       <ScrollView>
  //         {/* Hidden audio player for remote stream */}
  //         <RTCAudioPlayer stream={remoteStream} />

  //         <Text style={styles.title}>OpenAI Realtime Connection</Text>

  //         {/* Session Status */}
  //         <View style={styles.section}>
  //           <Text style={styles.sectionTitle}>Session Status</Text>
  //           <Text>Connected: {sessionConnected ? 'Yes' : 'No'}</Text>
  //           <Text>Loading: {sessionLoading ? 'Yes' : 'No'}</Text>
  //           {sessionError && (
  //             <Text style={styles.error}>Error: {sessionError}</Text>
  //           )}
  //           {session && <Text>Session ID: {session.session_id}</Text>}
  //         </View>

  //         {/* Realtime Status */}
  //         <View style={styles.section}>
  //           <Text style={styles.sectionTitle}>Realtime Status</Text>
  //           <Text>Connected: {realtimeConnected ? '✅ Yes' : '❌ No'}</Text>
  //           <Text>Connecting: {realtimeConnecting ? '🔄 Yes' : 'No'}</Text>
  //           {realtimeError && (
  //             <Text style={styles.error}>Error: {realtimeError}</Text>
  //           )}
  //           {localStream && (
  //             <Text>
  //               🎤 Local Stream: Active ({localStream.getTracks().length} tracks)
  //             </Text>
  //           )}
  //           {remoteStream && (
  //             <Text>
  //               🎵 Remote Stream: Active ({remoteStream.getTracks().length}{' '}
  //               tracks) - Audio should be playing
  //             </Text>
  //           )}
  //           {peerConnection && (
  //             <Text>
  //               🔗 Peer Connection: {peerConnection.connectionState || 'Unknown'}
  //             </Text>
  //           )}
  //         </View>

  //         {/* Controls */}
  //         <View style={styles.controls}>
  //           <TouchableOpacity
  //             style={[
  //               styles.button,
  //               !canStartConnection && styles.buttonDisabled,
  //             ]}
  //             onPress={handleStartConnection}
  //             disabled={!canStartConnection}>
  //             <Text style={styles.buttonText}>
  //               {realtimeConnecting ? 'Connecting...' : 'Start Connection'}
  //             </Text>
  //           </TouchableOpacity>

  //           <TouchableOpacity
  //             style={[styles.button, !canStopConnection && styles.buttonDisabled]}
  //             onPress={handleStopConnection}
  //             disabled={!canStopConnection}>
  //             <Text style={styles.buttonText}>Stop Connection</Text>
  //           </TouchableOpacity>

  //           <TouchableOpacity
  //             style={[styles.button, !realtimeConnected && styles.buttonDisabled]}
  //             onPress={handleSendMessage}
  //             disabled={!realtimeConnected}>
  //             <Text style={styles.buttonText}>Send Test Message</Text>
  //           </TouchableOpacity>

  //           <TouchableOpacity style={styles.button} onPress={handleCheckHealth}>
  //             <Text style={styles.buttonText}>Check Health</Text>
  //           </TouchableOpacity>

  //           <TouchableOpacity style={styles.button} onPress={clearSession}>
  //             <Text style={styles.buttonText}>Clear Session</Text>
  //           </TouchableOpacity>
  //         </View>
  //       </ScrollView>
  //     </View>
  //   );
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
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  controls: {
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 5,
  },
});

export default OpenAIRealtime;
