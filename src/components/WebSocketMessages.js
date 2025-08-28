import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../services/Common/theme';
import notifee from '@notifee/react-native';
import {getLocation} from '../functions/geolocation';
import webSocketService from '../services/WebSocketService';
import {RADIUS_IN_KILOMETERS} from '../utils/constants';

const WebSocketMessages = ({
  url,
  // messageTypes = [],
  isConnected,
  subscribe,
}) => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedType, setSelectedType] = useState('all');

  // Use refs to track subscription and prevent duplicate subscriptions
  const subscriptionRef = useRef(null);
  const isSubscribedRef = useRef(false);

  // Subscribe to report messages from Go backend
  // IMPORTANT: Even though we removed the cleanup function, React or the parent
  // component might still call unsubscribe. We handle this by blocking
  // unsubscribe calls for 'reports' type in WebSocketService.
  useEffect(() => {
    // Only proceed if we have all required functions and are connected
    if (!isConnected || !subscribe) {
      return;
    }

    // Prevent multiple subscriptions
    if (isSubscribedRef.current && subscriptionRef.current) {
      return;
    }

    try {
      // Subscribe to the "reports" message type that Go backend sends
      const subscriptionId = subscribe('reports', (payload, metadata) => {
        const newMessage = {
          id: Date.now(),
          type: 'reports',
          timestamp: new Date(),
          data: payload,
          metadata,
        };

        // check if the report is within the user's radius and display notification
        checkUserLocation(payload).then(isInRange => {
          if (isInRange) {
            onDisplayNotification(payload);
          }
        });

        setMessages(prev => {
          const updatedMessages = [newMessage, ...prev.slice(0, 99)]; // Keep last 100
          return updatedMessages;
        });
      });

      // Store subscription info in refs
      subscriptionRef.current = subscriptionId;
      isSubscribedRef.current = true;
    } catch (error) {
      console.error('Error creating subscription:', error);
      return;
    }

    // NO CLEANUP FUNCTION - subscription stays active forever
    // This prevents the immediate unsubscribe issue
  }, [isConnected, url, subscribe]); // Removed unsubscribe from dependencies

  // NO CLEANUP ON UNMOUNT - subscription stays active forever
  // This prevents any unsubscribe calls that could cause issues

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
    const {data} = message;

    if (!data || !data.reports) {
      return <Text style={styles.messageText}>No report data</Text>;
    }

    return (
      <View style={styles.reportContainer}>
        <Text style={styles.reportHeader}>
          📊 Reports Batch ({data.count} reports)
        </Text>
        <Text style={styles.reportDetails}>
          Sequence: {data.fromSeq} - {data.toSeq}
        </Text>
        {data.reports.slice(0, 3).map((reportWithAnalysis, index) => {
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

  const calculateDistance = (location, reportLocation) => {
    const R = 6371; // Radius of the earth in km
    const dLat =
      (reportLocation.latitude - location.latitude) * (Math.PI / 180);
    const dLon =
      (reportLocation.longitude - location.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(location.latitude * (Math.PI / 180)) *
        Math.cos(reportLocation.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const checkUserLocation = async payload => {
    let isInRange = false;

    try {
      const location = await getLocation();
      if (location) {
        if (!payload.reports || payload.reports.length === 0) {
          return false;
        }

        const report = payload.reports[0].report;

        const reportLocation = {
          latitude: report.latitude,
          longitude: report.longitude,
        };

        // Calculate the distance between the user's location and the report's location
        const distance = calculateDistance(location, reportLocation);

        if (distance < RADIUS_IN_KILOMETERS) {
          isInRange = true;
        }
      } else {
        isInRange = false;
      }
    } catch (error) {
      console.error('Error getting location:', error);
      isInRange = false;
    } finally {
      return isInRange;
    }
  };

  async function onDisplayNotification(payload) {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    try {
      if (!payload.reports || payload.reports.length === 0) {
        return false;
      }

      const report = payload.reports[0].report;

      let analysisText = '';
      if (
        !payload.reports[0].analysis ||
        payload.reports[0].analysis.length === 0
      ) {
        analysisText = '';
      } else {
        analysisText = payload.reports[0].analysis[0].summary;
      }

      // Display a notification
      await notifee.displayNotification({
        title: 'A new report has been detected',
        body: analysisText,
        android: {
          channelId,
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (e) {
      console.error('Error displaying notification:', e);
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
