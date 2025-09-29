import {useState, useCallback, useRef} from 'react';
import VoiceAssistantService, {
  CreateSessionRequest,
  CreateSessionResponse,
} from '../services/VoiceAssistantService';

interface UseVoiceSessionOptions {
  baseURL: string;
  autoRetry?: boolean;
  maxRetries?: number;
}

interface VoiceSessionState {
  session: CreateSessionResponse | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

export const useVoiceSession = (options: UseVoiceSessionOptions) => {
  const {baseURL, autoRetry = true, maxRetries = 3} = options;
  const apiRef = useRef(new VoiceAssistantService(baseURL));
  const retryCountRef = useRef(0);

  const [state, setState] = useState<VoiceSessionState>({
    session: null,
    isLoading: false,
    error: null,
    isConnected: false,
  });

  const createSession = useCallback(
    async (request: CreateSessionRequest = {}) => {
      setState(prev => ({...prev, isLoading: true, error: null}));

      try {
        const session = await apiRef.current.createSession(request as CreateSessionRequest);

        setState(prev => ({
          ...prev,
          session,
          isLoading: false,
          isConnected: true,
          error: null,
        }));

        retryCountRef.current = 0;
        return session;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          isConnected: false,
        }));

        // Auto-retry logic
        if (autoRetry && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setTimeout(() => {
            createSession(request);
          }, 2000 * retryCountRef.current); // Exponential backoff
        }

        throw error;
      }
    },
    [autoRetry, maxRetries],
  );

  const prewarmSession = useCallback(async () => {
    setState(prev => ({...prev, isLoading: true, error: null}));

    try {
      const session = await apiRef.current.prewarmSession();

      setState(prev => ({
        ...prev,
        session,
        isLoading: false,
        isConnected: true,
        error: null,
      }));

      return session;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isConnected: false,
      }));

      throw error;
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const isHealthy = await apiRef.current.checkHealth();
      setState(prev => ({...prev, isConnected: isHealthy}));
      return isHealthy;
    } catch {
      setState(prev => ({...prev, isConnected: false}));
      return false;
    }
  }, []);

  const clearSession = useCallback(() => {
    setState({
      session: null,
      isLoading: false,
      error: null,
      isConnected: false,
    });
    retryCountRef.current = 0;
  }, []);

  return {
    ...state,
    createSession,
    prewarmSession,
    checkHealth,
    clearSession,
  };
};
