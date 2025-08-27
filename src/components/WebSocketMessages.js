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
  //
  // SOLUTION: Never unsubscribe - keep subscription active permanently
  // This prevents the immediate unsubscribe issue that was causing
  // the subscription to be removed right after creation
  //
  // IMPORTANT: Even though we removed the cleanup function, React or the parent
  // component might still call unsubscribe. We handle this by blocking
  // unsubscribe calls for 'reports' type in WebSocketService.
  useEffect(() => {
    console.log('📱 [WebSocketMessages] useEffect triggered:', {
      isConnected,
      url,
      hasSubscribe: !!subscribe,
      subscribeType: typeof subscribe,
      timestamp: new Date().toISOString(),
      isAlreadySubscribed: isSubscribedRef.current,
      currentSubscriptionId: subscriptionRef.current,
    });

    // Only proceed if we have all required functions and are connected
    if (!isConnected || !subscribe) {
      console.log(
        '📱 [WebSocketMessages] WebSocket not connected or missing subscribe function, skipping subscription',
        {
          isConnected,
          hasSubscribe: !!subscribe,
          subscribeValue: subscribe,
          subscribeType: typeof subscribe,
          subscribeIsFunction: typeof subscribe === 'function',
        },
      );
      return;
    }

    // Prevent multiple subscriptions
    if (isSubscribedRef.current && subscriptionRef.current) {
      console.log(
        '📱 [WebSocketMessages] Already subscribed, skipping duplicate subscription',
        {subscriptionId: subscriptionRef.current},
      );
      return;
    }

    console.log(
      "📱 [WebSocketMessages] WebSocket connected, subscribing to 'reports' type",
    );

    try {
      console.log('📱 [WebSocketMessages] About to call subscribe function...');

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

        // check if the report is within the user's radius and display notification
        checkUserLocation(payload).then(isInRange => {
          if (isInRange) {
            onDisplayNotification(payload);
          } else {
            console.log(
              "📱 [WebSocketMessages] Report is not within the user's radius",
            );
          }
        });

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

      console.log('📱 [WebSocketMessages] Subscribe function returned:', {
        subscriptionId,
        subscriptionIdType: typeof subscriptionId,
        subscriptionIdIsNull: subscriptionId === null,
        subscriptionIdIsUndefined: subscriptionId === undefined,
      });

      // Store subscription info in refs
      subscriptionRef.current = subscriptionId;
      isSubscribedRef.current = true;

      console.log('📱 [WebSocketMessages] Subscription created and stored:', {
        subscriptionId,
        subscriptionRef: subscriptionRef.current,
        isSubscribed: isSubscribedRef.current,
      });

      // Debug: Check if subscription was actually stored in WebSocketService
      if (typeof subscribe === 'function' && subscribe.name === 'subscribe') {
        console.log(
          '📱 [WebSocketMessages] Subscribe function appears to be from WebSocketService',
        );
      } else {
        console.log(
          '📱 [WebSocketMessages] Subscribe function is NOT from WebSocketService:',
          {
            functionName: subscribe.name,
            functionType: typeof subscribe,
          },
        );
      }

      // Debug: Check WebSocketService subscription state
      console.log(
        '📱 [WebSocketMessages] WebSocketService subscription state:',
      );
      console.log(
        '📱 [WebSocketMessages] Has reports subscription type:',
        webSocketService.hasSubscriptionType('reports'),
      );
      console.log(
        '📱 [WebSocketMessages] Reports subscription count:',
        webSocketService.getSubscriptionCount('reports'),
      );
      webSocketService.debugSubscriptions();
    } catch (error) {
      console.error(
        '📱 [WebSocketMessages] Error creating subscription:',
        error,
      );
      return;
    }

    // NO CLEANUP FUNCTION - subscription stays active forever
    // This prevents the immediate unsubscribe issue
  }, [isConnected, url, subscribe]); // Removed unsubscribe from dependencies

  // NO CLEANUP ON UNMOUNT - subscription stays active forever
  // This prevents any unsubscribe calls that could cause issues

  // Debug effect to track subscription state changes
  useEffect(() => {
    console.log(
      '📱 [WebSocketMessages] Debug effect - checking subscription state:',
      {
        isConnected,
        url,
        hasSubscribe: !!subscribe,
        subscribeType: typeof subscribe,
        subscriptionRef: subscriptionRef.current,
        isSubscribed: isSubscribedRef.current,
      },
    );
  }, [isConnected, url, subscribe]);

  // Debug effect to track subscription state changes
  useEffect(() => {
    console.log('📱 [WebSocketMessages] Subscription state changed:', {
      isConnected,
      url,
      hasSubscription: !!subscriptionRef.current,
      subscriptionId: subscriptionRef.current,
      isSubscribed: isSubscribedRef.current,
    });
  }, [isConnected, url, subscriptionRef.current, isSubscribedRef.current]);

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
    //   {
    //     "reports": [
    //         {
    //             "report": {
    //                 "seq": 131,
    //                 "timestamp": "2025-08-27T05:51:31Z",
    //                 "id": "0xdff9426058ccA89C0297fb45E0620bc052899A5c",
    //                 "latitude": 3.320606,
    //                 "longitude": 23.530489
    //             },
    //             "analysis": [
    //                 {
    //                     "seq": 131,
    //                     "source": "ChatGPT",
    //                     "analysis_text": "```json\n{\n  \"title\": \"Litter Detected on Tram Tracks in Urban Area\",\n  \"description\": \"A piece of litter, specifically a small food wrapper, is observed on tram tracks in an urban area, increasing risk to tram operations and contributing to environmental impact.\",\n  \"classification\": \"Physical\",\n  \"user_info\": {\n      \"name\": null,\n      \"email\": null,\n      \"company\": null,\n      \"role\": null,\n      \"company_size\": null\n  },\n  \"location\": \"Intersection near visible tram stop and To Let sign, likely urban setting\",\n  \"brand_name\": null,\n  \"responsible_party\": \"Municipality Public Works\",\n  \"inferred_contact_emails\": [\"cityworks@municipality.gov\", \"cleaning@municipality.gov\", \"trammaintenance@municipality.gov\"],\n  \"suggested_remediation\": [\n      \"Deploy cleanup crew to the reported location to remove litter from tram tracks.\",\n      \"Enhance surveillance and monitoring for littering in public transport areas.\",\n      \"Implement public awareness campaigns about the impact of littering on public transport safety.\",\n      \"Introduce regular patrols on tram lines to ensure cleanliness and safety.\"\n  ],\n  \"litter_probability\": 0.95,\n  \"hazard_probability\": 0.6,\n  \"digital_bug_probabilty\": 0.0,\n  \"severity_level\": 0.4,\n  \"is_valid\": true\n}\n```",
    //                     "title": "Litter Detected on Tram Tracks in Urban Area",
    //                     "description": "A piece of litter, specifically a small food wrapper, is observed on tram tracks in an urban area, increasing risk to tram operations and contributing to environmental impact.",
    //                     "brand_name": "",
    //                     "brand_display_name": "",
    //                     "litter_probability": 0.95,
    //                     "hazard_probability": 0.6,
    //                     "digital_bug_probability": 0,
    //                     "severity_level": 0.4,
    //                     "summary": "Litter Detected on Tram Tracks in Urban Area: A piece of litter, specifically a small food wrapper, is observed on tram tracks in an urban area, increasing risk to tram operations and contributing to environmental impact.",
    //                     "language": "en",
    //                     "classification": "physical",
    //                     "created_at": "2025-08-27T05:51:42Z",
    //                     "updated_at": "0001-01-01T00:00:00Z"
    //                 }
    //             ]
    //         }
    //     ],
    //     "count": 1,
    //     "from_seq": 131,
    //     "to_seq": 131
    // }

    let isInRange = false;

    try {
      const location = await getLocation();
      if (location) {
        console.log('Location obtained:', location);
        console.log('Latitude:', location.latitude);
        console.log('Longitude:', location.longitude);

        if (!payload.reports || payload.reports.length === 0) {
          console.log('No reports found in websocket message');
          return false;
        }

        const report = payload.reports[0].report;

        const reportLocation = {
          latitude: report.latitude,
          longitude: report.longitude,
        };

        // Calculate the distance between the user's location and the report's location
        const distance = calculateDistance(location, reportLocation);
        console.log('Distance:', distance);
        if (distance < RADIUS_IN_KILOMETERS) {
          isInRange = true;
        }
      } else {
        console.log('Location permission denied or failed');
        isInRange = false;
      }
    } catch (error) {
      console.log('In catch');
      console.error('Error getting location:', error);
      isInRange = false;
    } finally {
      console.log('In finally');
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
        console.log('No reports found in websocket message');
        return false;
      }

      const report = payload.reports[0].report;

      let analysisText = '';
      if (
        !payload.reports[0].analysis ||
        payload.reports[0].analysis.length === 0
      ) {
        console.log('No analysis found in report');
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
