import React, {useState} from 'react';
import {Image, View, Text, StyleSheet, Dimensions} from 'react-native';
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

const ResponsiveImage: React.FC<ResponsiveImageProps> = React.memo(({
  reportSeq,
  maxHeight = 400,
  borderRadius = 8,
  showPlaceholder = true,
  placeholderText = 'No Image',
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
  const imageUrl = reportSeq && urls?.liveUrl
    ? `${urls.liveUrl}/api/v3/reports/rawimage?seq=${reportSeq}`
    : null;

  const onImageLoad = (event: any) => {
    setImageLoading(false);
    setImageError(false);
  };

  const onImageError = (error: any) => {
    setImageError(true);
    setImageLoading(false);
  };

  if (!imageUrl) {
    if (!showPlaceholder) return null;

    return (
      <View
        style={[
          styles.placeholder,
          {
            width: containerWidth,
            height: maxHeight,
            borderRadius,
          },
        ]}>
        <Text style={styles.placeholderText}>{placeholderText}</Text>
      </View>
    );
  }

  if (imageError) {
    return (
      <View
        style={[
          styles.errorContainer,
          {
            width: containerWidth,
            height: maxHeight,
            borderRadius,
          },
        ]}>
        <Text style={styles.errorText}>Failed to load image</Text>
      </View>
    );
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
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  image: {
    backgroundColor: 'black',
  },
  placeholder: {
    backgroundColor: theme.COLORS.PANEL_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.COLORS.TEXT_GREY,
    fontSize: 14,
    fontFamily: 'System',
  },
  errorContainer: {
    backgroundColor: theme.COLORS.PANEL_BG,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.COLORS.BTN_BG_BLUE,
  },
  errorText: {
    color: theme.COLORS.BTN_BG_BLUE,
    fontSize: 14,
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
