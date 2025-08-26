import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../services/Common/theme';
import notifee from '@notifee/react-native';

const WebSocketMessages = ({
  url,
  // messageTypes = [],
  isConnected,
  subscribe,
  unsubscribe,
}) => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedType, setSelectedType] = useState('all');

  // Subscribe to report messages from Go backend
  useEffect(() => {
    console.log('📱 [WebSocketMessages] useEffect triggered:', {
      isConnected,
      url,
      // messageTypes,
      hasSubscribe: !!subscribe,
      hasUnsubscribe: !!unsubscribe,
      subscribeType: typeof subscribe,
      unsubscribeType: typeof unsubscribe,
      timestamp: new Date().toISOString(),
      // Add detailed dependency tracking
      isConnectedValue: isConnected,
      urlValue: url,
      // messageTypesValue: messageTypes,
      // messageTypesLength: messageTypes.length,
      // messageTypesString: JSON.stringify(messageTypes),
    });

    if (isConnected && subscribe && unsubscribe) {
      console.log(
        "📱 [WebSocketMessages] WebSocket connected, subscribing to 'reports' type",
      );

      // Subscribe to the "reports" message type that Go backend sends
      const subscriptionId = subscribe('reports', (payload, metadata) => {
        console.log(
          '📱 [WebSocketMessages] Reports subscription callback triggered:',
          {
            payload,
            metadata,
            payloadType: typeof payload,
            payloadKeys: payload ? Object.keys(payload) : 'N/A',
            payloadIsNull: payload === null,
            payloadIsUndefined: payload === undefined,
            timestamp: new Date().toISOString(),
          },
        );

        const newMessage = {
          id: Date.now(),
          type: 'reports',
          timestamp: new Date(),
          data: payload,
          metadata,
        };

        console.log('📱 [WebSocketMessages] Created new message object:', {
          newMessage,
          dataField: newMessage.data,
          dataType: typeof newMessage.data,
        });

        onDisplayNotification();

        setMessages(prev => {
          const updatedMessages = [newMessage, ...prev.slice(0, 99)]; // Keep last 100
          console.log('📱 [WebSocketMessages] Updated messages state:', {
            previousCount: prev.length,
            newCount: updatedMessages.length,
            firstMessage: updatedMessages[0],
          });
          return updatedMessages;
        });
      });

      console.log(
        '📱 [WebSocketMessages] Subscription created with ID:',
        subscriptionId,
      );

      return () => {
        console.log(
          '📱 [WebSocketMessages] useEffect cleanup running, removing subscription:',
          subscriptionId,
          'Reason: useEffect dependencies changed or component unmounting',
        );
        unsubscribe('reports', subscriptionId);
      };
    } else {
      console.log(
        '📱 [WebSocketMessages] WebSocket not connected or missing functions, skipping subscription',
      );
    }
  }, [isConnected, url]); // Restored dependencies now that re-render issue is fixed

  // Filter messages based on selected type
  useEffect(() => {
    if (selectedType === 'all') {
      setFilteredMessages(messages);
    } else {
      setFilteredMessages(messages.filter(msg => msg.type === selectedType));
    }
  }, [messages, selectedType]);

  const clearMessages = () => {
    // clearMessageHistory(); // This function is no longer available from useWebSocket
    setMessages([]);
    setFilteredMessages([]);
  };

  const formatTimestamp = timestamp => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderReportMessage = message => {
    console.log(
      '📱 [WebSocketMessages] renderReportMessage() called with message:',
      {
        message,
        messageType: typeof message,
        messageKeys: message ? Object.keys(message) : 'N/A',
      },
    );

    const {data} = message;

    console.log('📱 [WebSocketMessages] Extracted data from message:', {
      data,
      dataType: typeof data,
      dataIsNull: data === null,
      dataIsUndefined: data === undefined,
      dataKeys: data ? Object.keys(data) : 'N/A',
    });

    if (!data || !data.reports) {
      console.log('📱 [WebSocketMessages] No report data found in message');
      return <Text style={styles.messageText}>No report data</Text>;
    }

    console.log('📱 [WebSocketMessages] Report data found:', {
      reportsCount: data.reports.length,
      reportsType: typeof data.reports,
      firstReport: data.reports[0],
      dataKeys: Object.keys(data),
    });

    return (
      <View style={styles.reportContainer}>
        <Text style={styles.reportHeader}>
          📊 Reports Batch ({data.count} reports)
        </Text>
        <Text style={styles.reportDetails}>
          Sequence: {data.fromSeq} - {data.toSeq}
        </Text>
        {data.reports.slice(0, 3).map((reportWithAnalysis, index) => {
          console.log('📱 [WebSocketMessages] Rendering report:', {
            index,
            reportWithAnalysis,
            reportKeys: reportWithAnalysis
              ? Object.keys(reportWithAnalysis)
              : 'N/A',
          });

          return (
            <View key={index} style={styles.singleReport}>
              <Text style={styles.reportId}>
                ID: {reportWithAnalysis.report.id}
              </Text>
              <Text style={styles.reportLocation}>
                📍 {reportWithAnalysis.report.latitude.toFixed(4)},{' '}
                {reportWithAnalysis.report.longitude.toFixed(4)}
              </Text>
              <Text style={styles.reportTime}>
                ⏰{' '}
                {new Date(reportWithAnalysis.report.timestamp).toLocaleString()}
              </Text>
              {reportWithAnalysis.analysis &&
                reportWithAnalysis.analysis.length > 0 && (
                  <Text style={styles.analysisInfo}>
                    🔍 Analysis: {reportWithAnalysis.analysis[0].classification}
                    (Severity: {reportWithAnalysis.analysis[0].severityLevel})
                  </Text>
                )}
            </View>
          );
        })}
        {data.reports.length > 3 && (
          <Text style={styles.moreReports}>
            ... and {data.reports.length - 3} more reports
          </Text>
        )}
      </View>
    );
  };

  const renderMessage = message => {
    switch (message.type) {
      case 'reports':
        return renderReportMessage(message);
      default:
        return (
          <Text style={styles.messageText}>
            {JSON.stringify(message.data || message, null, 2)}
          </Text>
        );
    }
  };

  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    try {
      // Display a notification
      await notifee.displayNotification({
        title: 'Notification Title',
        body: 'Main body content of the notification',
        android: {
          channelId,
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (e) {
      console.log('📱 [WebSocketMessages] Error displaying notification:', e);
    }
  }

  return <></>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.BG || '#FFFFFF',
    padding: 16,
  },
  disconnectedText: {
    textAlign: 'center',
    color: theme.COLORS.GRAY || '#9E9E9E',
    fontSize: 16,
    marginTop: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    backgroundColor: theme.COLORS.GRAY || '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: theme.COLORS.PRIMARY || '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.COLORS.TEXT || '#333333',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  messagesContainer: {
    flex: 1,
  },
  messageContainer: {
    backgroundColor: theme.COLORS.BG || '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.COLORS.PRIMARY || '#2196F3',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageType: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.COLORS.PRIMARY || '#2196F3',
    textTransform: 'uppercase',
  },
  messageTimestamp: {
    fontSize: 12,
    color: theme.COLORS.GRAY || '#9E9E9E',
  },
  messageText: {
    fontSize: 14,
    color: theme.COLORS.TEXT || '#333333',
    lineHeight: 20,
  },
  reportContainer: {
    backgroundColor: theme.COLORS.BG || '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.COLORS.PRIMARY || '#2196F3',
  },
  reportHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.PRIMARY || '#2196F3',
    marginBottom: 8,
  },
  reportDetails: {
    fontSize: 13,
    color: theme.COLORS.GRAY || '#9E9E9E',
    marginBottom: 12,
  },
  singleReport: {
    backgroundColor: theme.COLORS.BG || '#E0E0E0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  reportId: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.COLORS.TEXT || '#333333',
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 13,
    color: theme.COLORS.GRAY || '#9E9E9E',
    marginBottom: 4,
  },
  reportTime: {
    fontSize: 12,
    color: theme.COLORS.GRAY || '#9E9E9E',
    marginBottom: 4,
  },
  analysisInfo: {
    fontSize: 12,
    color: theme.COLORS.GRAY || '#9E9E9E',
  },
  moreReports: {
    fontSize: 12,
    color: theme.COLORS.GRAY || '#9E9E9E',
    marginTop: 8,
  },
  noMessagesText: {
    textAlign: 'center',
    color: theme.COLORS.GRAY || '#9E9E9E',
    fontSize: 16,
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: theme.COLORS.ERROR || '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WebSocketMessages;
