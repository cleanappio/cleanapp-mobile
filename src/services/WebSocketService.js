// Custom EventEmitter implementation for React Native
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  off(event, listener) {
    if (!this.events[event]) return this;

    if (listener) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    } else {
      delete this.events[event];
    }
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) return false;

    this.events[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });

    return true;
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
}

class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.url = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.messageQueue = [];
    this.subscriptions = new Map();
    this.isReconnecting = false;
  }

  /**
   * Connect to WebSocket server
   * @param {string} url - WebSocket server URL
   * @param {Object} options - Connection options
   */
  connect(url, options = {}) {
    console.log('🔌 [WebSocketService] connect() called with URL:', url);
    console.log('🔌 [WebSocketService] connect() options:', options);

    if (this.isConnected || this.isReconnecting) {
      console.log(
        '🔌 [WebSocketService] Already connected or reconnecting, skipping connection',
      );
      return Promise.resolve();
    }

    this.url = url;
    const {
      protocols = [],
      headers = {},
      reconnect = true,
      // Go backend handles ping/pong, so disable client heartbeat
      heartbeat = false,
      heartbeatInterval = 30000,
      heartbeatTimeout = 5000,
    } = options;

    console.log('🔌 [WebSocketService] Connection parameters:', {
      url: this.url,
      protocols,
      headers,
      reconnect,
      heartbeat,
      heartbeatInterval,
      heartbeatTimeout,
    });

    return new Promise((resolve, reject) => {
      try {
        console.log('🔌 [WebSocketService] Creating new WebSocket instance...');
        this.ws = new WebSocket(url, protocols);

        // Set up event handlers
        this.ws.onopen = () => {
          console.log(
            '🔌 [WebSocketService] WebSocket connection opened successfully!',
          );
          console.log('🔌 [WebSocketService] Connection details:', {
            url: this.ws.url,
            protocol: this.ws.protocol,
            readyState: this.ws.readyState,
            bufferedAmount: this.ws.bufferedAmount,
          });

          this.isConnected = true;
          this.isReconnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;

          // Go backend handles ping/pong, so don't start client heartbeat
          // if (heartbeat) {
          //   this.startHeartbeat(heartbeatInterval, heartbeatTimeout);
          // }

          // Process queued messages
          this.processMessageQueue();

          // Emit connection event
          this.emit('connected', {url, timestamp: Date.now()});

          console.log(
            '🔌 [WebSocketService] Connection established and ready for messages',
          );
          resolve();
        };

        this.ws.onmessage = event => {
          console.log('📨 [WebSocketService] Raw message received:', {
            data: event.data,
            type: event.type,
            timestamp: new Date().toISOString(),
          });

          try {
            console.log(
              '📨 [WebSocketService] Attempting to parse message as JSON...',
            );
            const data = JSON.parse(event.data);
            console.log(
              '📨 [WebSocketService] Successfully parsed JSON message:',
              {
                parsedData: data,
                dataType: typeof data,
                hasType: 'type' in data,
                hasPayload: 'payload' in data,
                hasData: 'data' in data,
                keys: Object.keys(data),
              },
            );

            // Handle double-encoded JSON from Go backend
            if (data.data && typeof data.data === 'string') {
              console.log(
                '📨 [WebSocketService] Detected double-encoded JSON, parsing inner data...',
              );
              try {
                const innerData = JSON.parse(data.data);
                console.log(
                  '📨 [WebSocketService] Successfully parsed inner JSON:',
                  innerData,
                );
                this.handleMessage(innerData);
              } catch (innerError) {
                console.error(
                  '❌ [WebSocketService] Failed to parse inner JSON:',
                  innerError,
                );
                // Fall back to original data
                this.handleMessage(data);
              }
            } else {
              this.handleMessage(data);
            }
          } catch (error) {
            console.error(
              '❌ [WebSocketService] Error parsing WebSocket message:',
              error,
            );
            console.error(
              '❌ [WebSocketService] Raw message that failed to parse:',
              event.data,
            );
            this.emit('error', {
              error: 'Invalid message format',
              data: event.data,
              parseError: error.message,
            });
          }
        };

        this.ws.onclose = event => {
          console.log('🔌 [WebSocketService] WebSocket connection closed:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            timestamp: new Date().toISOString(),
          });

          this.isConnected = false;
          this.stopHeartbeat();

          // Emit disconnection event
          this.emit('disconnected', {
            code: event.code,
            reason: event.reason,
            timestamp: Date.now(),
          });

          // Attempt reconnection if enabled
          if (reconnect && !this.isReconnecting) {
            console.log('🔌 [WebSocketService] Attempting to reconnect...');
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = error => {
          console.error(
            '❌ [WebSocketService] WebSocket error occurred:',
            error,
          );
          console.error('❌ [WebSocketService] Error details:', {
            message: error.message,
            type: error.type,
            target: error.target,
            timestamp: new Date().toISOString(),
          });

          this.emit('error', {error: error.message || 'WebSocket error'});
          reject(error);
        };
      } catch (error) {
        console.error(
          '❌ [WebSocketService] Error creating WebSocket connection:',
          error,
        );
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.stopHeartbeat();
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
      this.isConnected = false;
      this.isReconnecting = false;
      this.messageQueue = [];
      // Don't clear subscriptions on disconnect - preserve them for reconnection
      console.log('WebSocket disconnected by client');
    }
  }

  /**
   * Send message to WebSocket server
   * @param {Object|string} message - Message to send
   * @param {boolean} queueIfDisconnected - Queue message if disconnected
   */
  send(message, queueIfDisconnected = true) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (queueIfDisconnected) {
        this.messageQueue.push(message);
        console.log('Message queued, WebSocket not connected');
        return false;
      }
      throw new Error('WebSocket not connected');
    }

    try {
      const messageStr =
        typeof message === 'string' ? message : JSON.stringify(message);
      this.ws.send(messageStr);
      this.emit('messageSent', {message, timestamp: Date.now()});
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      this.emit('error', {
        error: 'Failed to send message',
        originalError: error,
      });
      return false;
    }
  }

  /**
   * Subscribe to a specific message type
   * @param {string} type - Message type to subscribe to
   * @param {Function} callback - Callback function
   * @param {string} id - Optional subscription ID
   */
  subscribe(type, callback, id = null) {
    console.log('🔔 [WebSocketService] subscribe() called with:', {
      type,
      callbackType: typeof callback,
      callbackName: callback.name || 'anonymous',
      id,
      currentSubscriptionsForType: this.subscriptions.has(type)
        ? this.subscriptions.get(type).size
        : 0,
    });

    const subscriptionId = id || `${type}_${Date.now()}_${Math.random()}`;

    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, new Map());
      console.log(
        '🔔 [WebSocketService] Created new subscription type map for:',
        type,
      );
    }

    // Check if this exact callback is already subscribed
    const typeSubscriptions = this.subscriptions.get(type);
    for (const [existingId, existingCallback] of typeSubscriptions) {
      if (existingCallback === callback) {
        console.log(
          '🔔 [WebSocketService] Callback already subscribed, returning existing ID:',
          existingId,
        );
        return existingId;
      }
    }

    typeSubscriptions.set(subscriptionId, callback);

    console.log('🔔 [WebSocketService] New subscription created:', {
      type,
      id: subscriptionId,
      totalSubscriptionsForType: typeSubscriptions.size,
      totalSubscriptions: Array.from(this.subscriptions.values()).reduce(
        (total, typeSubs) => total + typeSubs.size,
        0,
      ),
    });

    // Emit subscription event
    this.emit('subscribed', {type, id: subscriptionId});

    console.log(
      '🔔 [WebSocketService] Subscription completed, returning ID:',
      subscriptionId,
    );
    return subscriptionId;
  }

  /**
   * Unsubscribe from a specific message type
   * @param {string} type - Message type to unsubscribe from
   * @param {string} id - Subscription ID (if null, unsubscribes all for type)
   */
  unsubscribe(type, id = null) {
    console.log('🔔 [WebSocketService] unsubscribe() called:', {
      type,
      id,
      hasType: this.subscriptions.has(type),
      currentSubscriptions: Array.from(this.subscriptions.keys()),
      stack: new Error().stack, // This will show the call stack
    });

    // SPECIAL CASE: Never unsubscribe from 'reports' type
    // This prevents React or parent components from accidentally removing
    // the reports subscription that we want to keep active forever
    if (type === 'reports') {
      console.log(
        '🔔 [WebSocketService] BLOCKED: Cannot unsubscribe from reports type',
      );
      console.log(
        '🔔 [WebSocketService] Reports subscriptions are permanent and cannot be removed',
      );
      return true; // Pretend unsubscribe was successful
    }

    if (!this.subscriptions.has(type)) {
      console.log(
        '🔔 [WebSocketService] No subscriptions found for type:',
        type,
      );
      return false;
    }

    if (id === null) {
      // Unsubscribe all for this type
      const count = this.subscriptions.get(type).size;
      this.subscriptions.delete(type);
      console.log(
        '🔔 [WebSocketService] Unsubscribed all subscriptions for type:',
        {
          type,
          removedCount: count,
        },
      );
      this.emit('unsubscribed', {type, id: null});
      return true;
    } else {
      // Unsubscribe specific subscription
      const typeSubscriptions = this.subscriptions.get(type);
      if (typeSubscriptions && typeSubscriptions.has(id)) {
        typeSubscriptions.delete(id);
        console.log(
          '🔔 [WebSocketService] Unsubscribed specific subscription:',
          {
            type,
            id,
            remainingForType: typeSubscriptions.size,
          },
        );

        // Remove type if no more subscriptions
        if (typeSubscriptions.size === 0) {
          this.subscriptions.delete(type);
          console.log(
            '🔔 [WebSocketService] Removed empty subscription type:',
            type,
          );
        }

        this.emit('unsubscribed', {type, id});
        return true;
      }
    }

    return false;
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    if (!this.ws) {
      return 'disconnected';
    }

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      isConnected: this.isConnected,
      isReconnecting: this.isReconnecting,
      reconnectAttempts: this.reconnectAttempts,
      messageQueueSize: this.messageQueue.length,
      subscriptionCount: Array.from(this.subscriptions.values()).reduce(
        (total, typeSubs) => total + typeSubs.size,
        0,
      ),
      url: this.url,
      connectionStatus: this.getConnectionStatus(),
    };
  }

  /**
   * Check if a subscription exists for a given type and callback
   * @param {string} type - Message type
   * @param {Function} callback - Callback function
   * @returns {string|null} - Subscription ID if exists, null otherwise
   */
  hasSubscription(type, callback) {
    if (!this.subscriptions.has(type)) {
      return null;
    }

    const typeSubscriptions = this.subscriptions.get(type);
    for (const [id, existingCallback] of typeSubscriptions) {
      if (existingCallback === callback) {
        return id;
      }
    }
    return null;
  }

  /**
   * Get all active subscriptions
   */
  getSubscriptions() {
    const result = {};
    for (const [type, typeSubs] of this.subscriptions) {
      result[type] = Array.from(typeSubs.keys());
    }
    return result;
  }

  /**
   * Debug method to log current subscription state
   */
  debugSubscriptions() {
    console.log('🔍 [WebSocketService] Current subscription state:');
    console.log(
      '🔍 [WebSocketService] Total subscription types:',
      this.subscriptions.size,
    );

    for (const [type, typeSubs] of this.subscriptions) {
      console.log(`🔍 [WebSocketService] Type '${type}':`, {
        count: typeSubs.size,
        ids: Array.from(typeSubs.keys()),
        callbacks: Array.from(typeSubs.values()).map(
          cb => cb.name || 'anonymous',
        ),
      });
    }
  }

  /**
   * Check if a specific subscription type exists
   * @param {string} type - Message type to check
   * @returns {boolean} - True if subscriptions exist for this type
   */
  hasSubscriptionType(type) {
    return (
      this.subscriptions.has(type) && this.subscriptions.get(type).size > 0
    );
  }

  /**
   * Get subscription count for a specific type
   * @param {string} type - Message type
   * @returns {number} - Number of subscriptions for this type
   */
  getSubscriptionCount(type) {
    if (!this.subscriptions.has(type)) return 0;
    return this.subscriptions.get(type).size;
  }

  // Private methods

  handleMessage(data) {
    console.log('📨 [WebSocketService] handleMessage() called with data:', {
      data,
      dataType: typeof data,
      isNull: data === null,
      isUndefined: data === undefined,
      keys: data ? Object.keys(data) : 'N/A',
    });

    // Additional validation for the data structure
    if (!data || typeof data !== 'object') {
      console.error(
        '❌ [WebSocketService] Invalid data received in handleMessage:',
        data,
      );
      return;
    }

    // Extract message properties with detailed logging
    const {type, payload, id, timestamp, data: messageData} = data;

    console.log('📨 [WebSocketService] Extracted message properties:', {
      type,
      payload,
      id,
      timestamp,
      messageData,
      hasType: type !== undefined,
      hasPayload: payload !== undefined,
      hasId: id !== undefined,
      hasTimestamp: timestamp !== undefined,
      hasMessageData: messageData !== undefined,
    });

    // Emit raw message event with Go backend compatible structure
    console.log("📨 [WebSocketService] Emitting 'message' event with data:", {
      type,
      payload: messageData, // Use messageData (Go's 'data' field) as payload
      id,
      timestamp,
      raw: data,
    });
    this.emit('message', {
      type,
      payload: messageData,
      id,
      timestamp,
      raw: data,
    });

    // Handle subscriptions with detailed logging
    if (type && this.subscriptions.has(type)) {
      console.log('📨 [WebSocketService] Found subscriptions for type:', type);
      const typeSubscriptions = this.subscriptions.get(type);
      console.log('📨 [WebSocketService] Type subscriptions:', {
        subscriptionCount: typeSubscriptions.size,
        subscriptionIds: Array.from(typeSubscriptions.keys()),
      });

      console.log(
        '📨 [WebSocketService] About to call subscription callbacks with data:',
        {
          type,
          messageData,
          payload,
          actualPayload: messageData || payload,
        },
      );

      typeSubscriptions.forEach((callback, subscriptionId) => {
        // Use messageData (Go's 'data' field) as the actual payload for callbacks
        const actualPayload = messageData || payload;
        console.log('📨 [WebSocketService] Calling subscription callback:', {
          subscriptionId,
          type,
          originalPayload: payload,
          actualPayload: actualPayload,
          callbackType: typeof callback,
        });

        try {
          // Use messageData (Go's 'data' field) as the actual payload for callbacks
          const actualPayload = messageData || payload;
          callback(actualPayload, {type, id, timestamp});
          console.log(
            '📨 [WebSocketService] Subscription callback executed successfully',
          );
        } catch (error) {
          console.error(
            '❌ [WebSocketService] Error in subscription callback:',
            {
              error: error.message,
              stack: error.stack,
              subscriptionId,
              type,
              payload: messageData || payload,
            },
          );
          this.emit('error', {
            error: 'Subscription callback error',
            type,
            originalError: error,
          });
        }
      });
    } else {
      console.log(
        '📨 [WebSocketService] No subscriptions found for type:',
        type,
      );
      console.log(
        '📨 [WebSocketService] Available subscription types:',
        Array.from(this.subscriptions.keys()),
      );
    }

    // Handle specific message types from Go backend
    console.log('📨 [WebSocketService] Processing message type:', type);
    switch (type) {
      case 'pong':
        console.log('📨 [WebSocketService] Handling pong message');
        // Go backend sends pong responses to our pings
        this.handlePong();
        break;
      case 'reports':
        console.log(
          '📨 [WebSocketService] Handling reports message from Go backend',
        );
        console.log(
          '📨 [WebSocketService] Go backend data field:',
          messageData,
        );
        console.log('📨 [WebSocketService] Legacy payload field:', payload);

        // Go backend uses 'data' field, so use messageData as the primary source
        const reportData = messageData || payload;
        console.log(
          '📨 [WebSocketService] Final report data to emit:',
          reportData,
          {reportDataString: reportData.toString()},
        );

        console.log(
          "📨 [WebSocketService] Emitting 'reports' event with data:+++++++++++",
          {
            reports: reportData.reports,
            reportsString: reportData.reports.toString(),
            reportsAnalysis: reportData.reports[0].analysis,
            reportsAnalysisString: reportData.reports[0].analysis.toString(),
          },
        );

        // Go backend broadcasts report data
        this.emit('reports', reportData);
        break;
      case 'error':
        console.log('📨 [WebSocketService] Handling error message from server');
        this.emit('serverError', payload);
        break;
      default:
        console.log(
          '📨 [WebSocketService] Handling default message type:',
          type,
        );
        // Emit typed event with Go backend compatible data
        const defaultData = messageData || payload;
        this.emit(type, defaultData);
    }

    console.log('📨 [WebSocketService] handleMessage() completed');
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnectFailed', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
      });
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay,
    );

    setTimeout(() => {
      if (this.isReconnecting) {
        console.log('🔌 [WebSocketService] Attempting reconnection...');
        this.connect(this.url, {reconnect: true})
          .then(() => {
            console.log(
              '🔌 [WebSocketService] Reconnection successful, restoring subscriptions...',
            );
            // Emit event to notify components that subscriptions are restored
            this.emit('reconnected', {
              timestamp: Date.now(),
              subscriptionCount: Array.from(this.subscriptions.values()).reduce(
                (total, typeSubs) => total + typeSubs.size,
                0,
              ),
            });
          })
          .catch(error => {
            console.error('🔌 [WebSocketService] Reconnection failed:', error);
          });
      }
    }, delay);
  }

  startHeartbeat(interval, timeout) {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({type: 'ping', timestamp: Date.now()});

        // Set timeout for pong response
        this.heartbeatTimeout = setTimeout(() => {
          this.ws.close(1000, 'Heartbeat timeout');
        }, timeout);
      }
    }, interval);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  handlePong() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message, false);
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
