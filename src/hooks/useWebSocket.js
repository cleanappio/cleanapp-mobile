import { useCallback, useEffect, useRef, useState } from "react";
import webSocketService from "../services/WebSocketService";

/**
 * React hook for using WebSocket service in components
 * @param {string} url - WebSocket server URL
 * @param {Object} options - Connection options
 * @returns {Object} WebSocket state and methods
 */
export const useWebSocket = (url, options = {}) => {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  const messageHistory = useRef([]);
  const subscriptions = useRef(new Map());
  const reconnectAttempts = useRef(0);

  // Default options
  const defaultOptions = {
    autoConnect: true,
    reconnect: true,
    // Go backend handles ping/pong, so disable client heartbeat
    heartbeat: false,
    heartbeatInterval: 30000,
    heartbeatTimeout: 5000,
    maxReconnectAttempts: 5,
    ...options,
  };

  // Connect to WebSocket
  const connect = useCallback(async () => {
    try {
      setError(null);
      await webSocketService.connect(url, defaultOptions);
    } catch (err) {
      setError(err.message || "Failed to connect");
      console.error("WebSocket connection error:", err);
    }
  }, [url, defaultOptions]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  // Send message
  const send = useCallback((message, queueIfDisconnected = true) => {
    return webSocketService.send(message, queueIfDisconnected);
  }, []);

  // Subscribe to message type
  const subscribe = useCallback(
    (type, callback, id = null) => {
      console.log("🔔 [useWebSocket] subscribe() called:", {
        type,
        callbackType: typeof callback,
        id,
        url,
        hookRenderCount: Date.now(), // Track when this function is called
      });

      const subscriptionId = webSocketService.subscribe(
        type,
        (payload, metadata) => {
          console.log("🔔 [useWebSocket] Subscription callback triggered:", {
            type,
            payload,
            metadata,
            payloadType: typeof payload,
            payloadKeys: payload ? Object.keys(payload) : "N/A",
            timestamp: Date.now(),
          });

          setLastMessage({ type, payload, metadata, timestamp: Date.now() });

          // Add to message history
          messageHistory.current.push({
            type,
            payload,
            metadata,
            timestamp: Date.now(),
          });

          // Keep only last 100 messages
          if (messageHistory.current.length > 100) {
            messageHistory.current.shift();
          }

          // Call the callback
          if (callback) {
            console.log(
              "🔔 [useWebSocket] Calling user callback with payload:",
              payload
            );
            callback(payload, metadata);
          }
        },
        id
      );

      console.log(
        "🔔 [useWebSocket] Subscription created with ID:",
        subscriptionId
      );

      // Store subscription reference
      subscriptions.current.set(type, subscriptionId);

      return subscriptionId;
    },
    [url]
  );

  // Unsubscribe from message type
  const unsubscribe = useCallback(
    (type, id = null) => {
      const subscriptionId = subscriptions.current.get(type);
      if (subscriptionId) {
        webSocketService.unsubscribe(type, id || subscriptionId);
        subscriptions.current.delete(type);
      }
    },
    [url]
  );

  // Get message history
  const getMessageHistory = useCallback((type = null, limit = 50) => {
    let messages = messageHistory.current;

    if (type) {
      messages = messages.filter((msg) => msg.type === type);
    }

    return messages.slice(-limit);
  }, []);

  // Clear message history
  const clearMessageHistory = useCallback(() => {
    messageHistory.current = [];
  }, []);

  // Get connection stats
  const getStats = useCallback(() => {
    return webSocketService.getStats();
  }, []);

  // Update stats periodically - REMOVED to prevent constant re-renders
  // useEffect(() => {
  //   const statsInterval = setInterval(() => {
  //     setStats(webSocketService.getStats());
  //   }, 1000);

  //   return () => clearInterval(statsInterval);
  // }, []);

  // Set up event listeners
  useEffect(() => {
    const handleConnected = (data) => {
      setIsConnected(true);
      setConnectionStatus("connected");
      setIsReconnecting(false);
      setError(null);
      reconnectAttempts.current = 0;
    };

    const handleDisconnected = (data) => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
      setIsReconnecting(false);
    };

    const handleReconnecting = () => {
      setIsReconnecting(true);
      setConnectionStatus("connecting");
      reconnectAttempts.current++;
    };

    const handleError = (errorData) => {
      setError(errorData.error || "WebSocket error");
    };

    const handleReconnectFailed = (data) => {
      setIsReconnecting(false);
      setConnectionStatus("failed");
      setError(`Reconnection failed after ${data.attempts} attempts`);
    };

    // Subscribe to WebSocket events
    webSocketService.on("connected", handleConnected);
    webSocketService.on("disconnected", handleDisconnected);
    webSocketService.on("reconnecting", handleReconnecting);
    webSocketService.on("error", handleError);
    webSocketService.on("reconnectFailed", handleReconnectFailed);

    // Auto-connect if enabled
    if (defaultOptions.autoConnect && url) {
      connect();
    }

    // Cleanup function
    return () => {
      webSocketService.off("connected", handleConnected);
      webSocketService.off("disconnected", handleDisconnected);
      webSocketService.off("reconnecting", handleReconnecting);
      webSocketService.off("error", handleError);
      webSocketService.off("reconnectFailed", handleReconnectFailed);

      // Unsubscribe from all message types
      subscriptions.current.forEach((subscriptionId, type) => {
        webSocketService.unsubscribe(type, subscriptionId);
      });
      subscriptions.current.clear();
    };
  }, [url, defaultOptions.autoConnect, connect]);

  return {
    // State
    connectionStatus,
    isConnected,
    isReconnecting,
    lastMessage,
    error,
    stats,

    // Methods
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
    getMessageHistory,
    clearMessageHistory,
    getStats,

    // Utility
    messageHistory: messageHistory.current,
  };
};

export default useWebSocket;
