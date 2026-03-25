import React, {useState} from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {theme} from '../services/Common/theme';
import {getUrls} from '../services/API/Settings';

interface ResponsiveImageProps {
  reportSeq?: string; // New prop for report sequence
  maxHeight?: number;
  borderRadius?: number;
  showPlaceholder?: boolean;
  placeholderText?: string;
  containerWidth?: number;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'repeat' | 'center';
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = React.memo(
  ({
    reportSeq,
    maxHeight = 400,
    borderRadius = 8,
    showPlaceholder = true,
    placeholderText = '⚠️',
    containerWidth: propContainerWidth,
    resizeMode = 'contain',
  }) => {
    const [imageHeight, setImageHeight] = useState<number | null>(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const screenWidth = Dimensions.get('window').width;
    const containerWidth = propContainerWidth || screenWidth - 32; // Use prop or calculate

    // Generate raw image URL
    const urls = getUrls();
    const imageUrl =
      reportSeq && urls?.liveUrl
        ? `${urls.liveUrl}/api/v3/reports/rawimage?seq=${reportSeq}`
        : null;
    const isCompactPlaceholder = placeholderText.trim().length <= 2;
    const compactPlaceholderSize = Math.min(
      48,
      Math.max(24, Math.round(maxHeight * 0.5)),
    );

    const onImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
    };

    const onImageError = () => {
      setImageError(true);
      setImageLoading(false);
    };

    const renderFallback = (containerStyle: StyleProp<ViewStyle>) => {
      if (!showPlaceholder) return null;
      return (
        <View
          style={[
            containerStyle,
            {
              width: containerWidth,
              height: maxHeight,
              borderRadius,
            },
          ]}>
          <Text
            style={[
              isCompactPlaceholder
                ? styles.placeholderEmoji
                : styles.placeholderText,
              isCompactPlaceholder && {
                fontSize: compactPlaceholderSize,
                lineHeight: compactPlaceholderSize,
              },
            ]}>
            {placeholderText}
          </Text>
        </View>
      );
    };

    if (!imageUrl) {
      return renderFallback(styles.fallbackContainer);
    }

    if (imageError) {
      return renderFallback(styles.fallbackContainer);
    }

    return (
      <View style={[styles.container, {width: containerWidth}]}>
        {imageLoading && (
          <View
            style={[
              styles.loadingContainer,
              {
                width: '100%',
                height: maxHeight,
                borderRadius,
              },
            ]}>
            {resizeMode === 'contain' && (
              <Text style={styles.loadingText}>Loading...</Text>
            )}
          </View>
        )}

        <Image
          source={{uri: imageUrl}}
          style={[
            styles.image,
            {
              width: '100%',
              height: imageHeight || maxHeight,
              borderRadius,
              opacity: imageLoading ? 0 : 1,
            },
          ]}
          resizeMode={resizeMode}
          onLoad={onImageLoad}
          onError={onImageError}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  image: {
    backgroundColor: 'black',
  },
  fallbackContainer: {
    backgroundColor: theme.COLORS.PANEL_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.COLORS.TEXT_GREY,
    fontSize: 14,
    fontFamily: 'System',
  },
  placeholderEmoji: {
    fontSize: 24,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'System',
  },
  loadingContainer: {
    backgroundColor: theme.COLORS.PANEL_BG,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingText: {
    color: theme.COLORS.TEXT_GREY,
    fontSize: 14,
    fontFamily: 'System',
  },
});

export default ResponsiveImage;
