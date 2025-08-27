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
    if (this.isConnected || this.isReconnecting) {
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

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url, protocols);

        // Set up event handlers
        this.ws.onopen = () => {
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

          resolve();
        };

        this.ws.onmessage = event => {
          try {
            const data = JSON.parse(event.data);

            // Handle double-encoded JSON from Go backend
            if (data.data && typeof data.data === 'string') {
              try {
                const innerData = JSON.parse(data.data);
                this.handleMessage(innerData);
              } catch (innerError) {
                // Fall back to original data
                this.handleMessage(data);
              }
            } else {
              this.handleMessage(data);
            }
          } catch (error) {
            this.emit('error', {
              error: 'Invalid message format',
              data: event.data,
              parseError: error.message,
            });
          }
        };

        this.ws.onclose = event => {
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
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = error => {
          this.emit('error', {error: error.message || 'WebSocket error'});
          reject(error);
        };
      } catch (error) {
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
    const subscriptionId = id || `${type}_${Date.now()}_${Math.random()}`;

    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, new Map());
    }

    // Check if this exact callback is already subscribed
    const typeSubscriptions = this.subscriptions.get(type);
    for (const [existingId, existingCallback] of typeSubscriptions) {
      if (existingCallback === callback) {
        return existingId;
      }
    }

    typeSubscriptions.set(subscriptionId, callback);

    // Emit subscription event
    this.emit('subscribed', {type, id: subscriptionId});

    return subscriptionId;
  }

  /**
   * Unsubscribe from a specific message type
   * @param {string} type - Message type to unsubscribe from
   * @param {string} id - Subscription ID (if null, unsubscribes all for type)
   */
  unsubscribe(type, id = null) {
    // SPECIAL CASE: Never unsubscribe from 'reports' type
    // This prevents React or parent components from accidentally removing
    // the reports subscription that we want to keep active forever
    if (type === 'reports') {
      return true; // Pretend unsubscribe was successful
    }

    if (!this.subscriptions.has(type)) {
      return false;
    }

    if (id === null) {
      // Unsubscribe all for this type
      const count = this.subscriptions.get(type).size;
      this.subscriptions.delete(type);
      this.emit('unsubscribed', {type, id: null});
      return true;
    } else {
      // Unsubscribe specific subscription
      const typeSubscriptions = this.subscriptions.get(type);
      if (typeSubscriptions && typeSubscriptions.has(id)) {
        typeSubscriptions.delete(id);

        // Remove type if no more subscriptions
        if (typeSubscriptions.size === 0) {
          this.subscriptions.delete(type);
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

  // Private methods

  handleMessage(data) {
    // Additional validation for the data structure
    if (!data || typeof data !== 'object') {
      console.error('Invalid data received in handleMessage:', data);
      return;
    }

    // Extract message properties
    const {type, payload, id, timestamp, data: messageData} = data;

    // Emit raw message event with Go backend compatible structure
    this.emit('message', {
      type,
      payload: messageData,
      id,
      timestamp,
      raw: data,
    });

    // Handle subscriptions
    if (type && this.subscriptions.has(type)) {
      const typeSubscriptions = this.subscriptions.get(type);

      typeSubscriptions.forEach((callback, subscriptionId) => {
        try {
          // Use messageData (Go's 'data' field) as the actual payload for callbacks
          const actualPayload = messageData || payload;
          callback(actualPayload, {type, id, timestamp});
        } catch (error) {
          console.error('Error in subscription callback:', {
            error: error.message,
            subscriptionId,
            type,
          });
          this.emit('error', {
            error: 'Subscription callback error',
            type,
            originalError: error,
          });
        }
      });
    }

    // Handle specific message types from Go backend
    switch (type) {
      case 'pong':
        // Go backend sends pong responses to our pings
        this.handlePong();
        break;
      case 'reports':
        // Go backend uses 'data' field, so use messageData as the primary source
        const reportData = messageData || payload;

        // Go backend broadcasts report data
        this.emit('reports', reportData);
        break;
      case 'error':
        this.emit('serverError', payload);
        break;
      default:
        // Emit typed event with Go backend compatible data
        const defaultData = messageData || payload;
        this.emit(type, defaultData);
    }
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
        this.connect(this.url, {reconnect: true})
          .then(() => {
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
            console.error('Reconnection failed:', error);
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
