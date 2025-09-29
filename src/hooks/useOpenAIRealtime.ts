import {useState, useCallback, useRef, useEffect} from 'react';
import {startOpenAIRealtime} from '../services/OpenAIRealtimeService';
import {useVoiceSession} from './useVoiceSession';
import VoiceAssistantService from '../services/VoiceAssistantService';

interface UseOpenAIRealtimeOptions {
  baseURL: string;
  autoRetry?: boolean;
  maxRetries?: number;
}

interface RealtimeState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  localStream: any | null;
  remoteStream: any | null;
  peerConnection: any | null;
}

export const useOpenAIRealtime = (options: UseOpenAIRealtimeOptions) => {
  const {baseURL, autoRetry = true, maxRetries = 3} = options;

  // Use the existing voice session hook
  const voiceSession = useVoiceSession({baseURL, autoRetry, maxRetries});

  // Voice assistant service instance
  const voiceAssistantServiceRef = useRef(new VoiceAssistantService(baseURL));

  // Realtime connection state
  const [realtimeState, setRealtimeState] = useState<RealtimeState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    localStream: null,
    remoteStream: null,
    peerConnection: null,
  });

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Cleanup function called');
    setRealtimeState(prev => {
      if (prev.peerConnection) {
        console.log('🔌 Closing peer connection');
        prev.peerConnection.close();
      }
      if (prev.localStream) {
        console.log('🎤 Stopping local stream tracks');
        prev.localStream.getTracks().forEach((track: any) => track.stop());
      }

      return {
        isConnected: false,
        isConnecting: false,
        error: null,
        localStream: null,
        remoteStream: null,
        peerConnection: null,
      };
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  /**
   * Start the OpenAI Realtime connection
   */
  const startConnection = useCallback(async () => {
    if (realtimeState.isConnecting || realtimeState.isConnected) {
      return;
    }

    setRealtimeState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      // First ensure we have a session
      if (!voiceSession.session) {
        await voiceSession.createSession();
      }

      // Start the WebRTC connection
      const {pc, localStream, remoteStream} = await startOpenAIRealtime(
        voiceAssistantServiceRef.current,
      );

      // Set up connection state monitoring
      const checkConnectionState = () => {
        console.log('Checking connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          console.log('✅ WebRTC connection established!');
          setRealtimeState(prev => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            localStream,
            remoteStream,
            peerConnection: pc,
            error: null,
          }));
        } else if (
          pc.connectionState === 'failed' ||
          pc.connectionState === 'disconnected'
        ) {
          console.log('❌ WebRTC connection failed:', pc.connectionState);
          setRealtimeState(prev => ({
            ...prev,
            isConnecting: false,
            isConnected: false,
            error: `Connection ${pc.connectionState}`,
          }));
        } else if (pc.connectionState === 'closed') {
          setRealtimeState(prev => ({
            ...prev,
            isConnecting: false,
            isConnected: false,
            error: null,
          }));
        }
      };

      // Set up connection state change listener
      (pc as any).onconnectionstatechange = () => {
        console.log('PC connection state changed:', pc.connectionState);
        checkConnectionState();
      };

      // Check initial state
      checkConnectionState();

      // Set up the peer connection and streams in state
      setRealtimeState(prev => ({
        ...prev,
        localStream,
        remoteStream,
        peerConnection: pc,
      }));

      return {pc, localStream};
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      setRealtimeState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, [voiceSession, realtimeState.isConnecting, realtimeState.isConnected]);

  /**
   * Stop the OpenAI Realtime connection
   */
  const stopConnection = useCallback(() => {
    cleanup();
  }, [cleanup]);

  /**
   * Send a message through the data channel
   */
  const sendMessage = useCallback(
    (message: string) => {
      if (!realtimeState.peerConnection || !realtimeState.isConnected) {
        throw new Error('Not connected to OpenAI Realtime');
      }

      try {
        const dataChannel =
          realtimeState.peerConnection.createDataChannel('message');
        dataChannel.send(message);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to send message: ${errorMessage}`);
      }
    },
    [realtimeState.peerConnection, realtimeState.isConnected],
  );

  /**
   * Check if the connection is healthy
   */
  const checkConnectionHealth = useCallback(async () => {
    try {
      const isHealthy = await voiceSession.checkHealth();
      setRealtimeState(prev => ({
        ...prev,
        isConnected: isHealthy && prev.isConnected,
      }));
      return isHealthy;
    } catch {
      setRealtimeState(prev => ({
        ...prev,
        isConnected: false,
      }));
      return false;
    }
  }, [voiceSession]);

  return {
    // Voice session state and methods
    ...voiceSession,

    // Realtime connection state
    ...realtimeState,

    // Realtime connection methods
    startConnection,
    stopConnection,
    sendMessage,
    checkConnectionHealth,

    // Computed properties
    canStartConnection:
      !realtimeState.isConnecting && !realtimeState.isConnected,
    canStopConnection: realtimeState.isConnected,
  };
};
