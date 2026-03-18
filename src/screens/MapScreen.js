import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../services/Common/theme';
import { getUrls } from '../services/API/Settings';
import { getMapLocation, getUserLocation } from '../services/DataManager';

const buildNativeLocationInjection = location => {
  const payload = JSON.stringify({
    type: 'NATIVE_LOCATION',
    lat: Number(location.latitude),
    lng: Number(location.longitude),
    accuracy: location.accuracy ? Number(location.accuracy) : undefined,
  });

  const cachedLocation = JSON.stringify({
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    accuracy: location.accuracy ? Number(location.accuracy) : undefined,
    timestamp: Date.now(),
  });

  return `
    (function() {
      try {
        var message = ${JSON.stringify(payload)};
        var cachedLocation = ${JSON.stringify(cachedLocation)};
        if (window.localStorage) {
          window.localStorage.setItem('cleanapp_user_location', cachedLocation);
          window.localStorage.setItem('cleanapp_location_permission', 'granted');
        }
        window.dispatchEvent(new MessageEvent('message', { data: message }));
        if (document && document.dispatchEvent) {
          document.dispatchEvent(new MessageEvent('message', { data: message }));
        }
      } catch (error) {
        console.warn('Failed to inject native location into embedded map', error);
      }
      true;
    })();
  `;
};

const MapScreen = () => {
  const webViewRef = React.useRef(null);
  const sendNativeLocationToWebView = React.useCallback(async () => {
    try {
      const userLocation = await getUserLocation();
      if (userLocation?.latitude && userLocation?.longitude) {
        webViewRef.current?.injectJavaScript(
          buildNativeLocationInjection(userLocation),
        );
        return;
      }

      const mapLocation = await getMapLocation();
      const coordinates = mapLocation?.coordinates;
      if (
        Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        Number.isFinite(coordinates[0]) &&
        Number.isFinite(coordinates[1]) &&
        !(coordinates[0] === 0 && coordinates[1] === 0)
      ) {
        webViewRef.current?.injectJavaScript(
          buildNativeLocationInjection({
            longitude: Number(coordinates[0]),
            latitude: Number(coordinates[1]),
          }),
        );
      }
    } catch (error) {
      console.warn('Failed to load cached native location for embedded map', error);
    }
  }, []);

  // Refresh WebView when tab becomes focused
  useFocusEffect(
    React.useCallback(() => {
      sendNativeLocationToWebView();
      return () => {
        webViewRef.current.reload();
      };
    }, [sendNativeLocationToWebView])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <WebView
        ref={webViewRef}
        source={{ uri: getUrls().mapUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEnabled={true}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        onLoadEnd={sendNativeLocationToWebView}
        onMessage={event => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data?.type === 'REQUEST_LOCATION') {
              sendNativeLocationToWebView();
            }
          } catch (error) {
            // Ignore unrelated messages from the embedded page
          }
        }}
        renderError={() => (
          <View style={styles.errorContainer}>
            <ActivityIndicator size="large" color={theme.COLORS.BTN_BG_BLUE} />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.BG,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.BG,
  },
});

export default MapScreen; 
