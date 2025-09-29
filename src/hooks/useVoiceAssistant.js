import {useState, useEffect, useCallback, useRef} from 'react';
import voiceAssistantService from '../services/VoiceAssistantService';

export const useVoiceAssistant = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [streamingData, setStreamingData] = useState('');

  const listenersRef = useRef(new Set());

  // Set up streaming listener
  useEffect(() => {
    const handleStreamingData = data => {
      switch (data.type) {
        case 'streaming_started':
          setIsStreaming(true);
          setIsLoading(true);
          setError(null);
          setCurrentResponse('');
          setStreamingData('');
          setRequestId(data.requestId);
          break;

        case 'streaming_data':
          setStreamingData(data.fullResponse);
          setCurrentResponse(data.fullResponse);
          break;

        case 'streaming_completed':
          setIsStreaming(false);
          setIsLoading(false);
          setStreamingData(data.response);
          setCurrentResponse(data.response);
          break;

        case 'streaming_done':
          setIsStreaming(false);
          setIsLoading(false);
          break;

        case 'streaming_error':
          setIsStreaming(false);
          setIsLoading(false);
          setError(data.error);
          break;

        default:
          break;
      }
    };

    // Add listener
    voiceAssistantService.addListener(handleStreamingData);
    listenersRef.current.add(handleStreamingData);

    // Cleanup on unmount
    return () => {
      listenersRef.current.forEach(listener => {
        voiceAssistantService.removeListener(listener);
      });
      listenersRef.current.clear();
    };
  }, []);

  /**
   * Send a prompt to the voice assistant
   * @param {string} prompt - The user's prompt
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response object
   */
  const sendPrompt = useCallback(
    async (prompt, options = {}) => {
      if (isStreaming) {
        throw new Error('Another request is already in progress');
      }

      try {
        setError(null);
        const result = await voiceAssistantService.sendPrompt(prompt, options);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [isStreaming],
  );

  /**
   * Cancel the current streaming request
   */
  const cancelRequest = useCallback(() => {
    voiceAssistantService.cancelCurrentRequest();
    setIsStreaming(false);
    setIsLoading(false);
    setError(null);
  }, []);

  /**
   * Clear the current response and error
   */
  const clearResponse = useCallback(() => {
    setCurrentResponse('');
    setStreamingData('');
    setError(null);
    setRequestId(null);
  }, []);

  /**
   * Get cached responses
   * @returns {Promise<Array>} - Array of cached responses
   */
  const getCachedResponses = useCallback(async () => {
    try {
      return await voiceAssistantService.getAllCachedResponses();
    } catch (err) {
      console.error('Failed to get cached responses:', err);
      return [];
    }
  }, []);

  /**
   * Clear all cached responses
   */
  const clearCache = useCallback(async () => {
    try {
      await voiceAssistantService.clearCache();
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
  }, []);

  /**
   * Test the API connection
   * @returns {Promise<Object>} - Test result
   */
  const testConnection = useCallback(async () => {
    try {
      return await voiceAssistantService.testConnection();
    } catch (err) {
      return {
        success: false,
        message: 'API connection failed',
        error: err.message,
      };
    }
  }, []);

  return {
    // State
    isStreaming,
    isLoading,
    currentResponse,
    streamingData,
    error,
    requestId,

    // Actions
    sendPrompt,
    cancelRequest,
    clearResponse,
    getCachedResponses,
    clearCache,
    testConnection,

    // Computed
    hasResponse: currentResponse.length > 0,
    hasError: !!error,
    isIdle: !isStreaming && !isLoading && !error,
  };
};
