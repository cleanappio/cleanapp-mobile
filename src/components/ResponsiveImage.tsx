import React, {useState} from 'react';
import {Image, View, Text, StyleSheet, Dimensions} from 'react-native';
import {theme} from '../services/Common/theme';

interface ResponsiveImageProps {
  base64Image: string;
  maxHeight?: number;
  borderRadius?: number;
  showPlaceholder?: boolean;
  placeholderText?: string;
  containerWidth?: number;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'repeat' | 'center';
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  base64Image,
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

  const onImageLoad = (event: any) => {
    const {width, height} = event.nativeEvent;
    const aspectRatio = height / width;

    let calculatedHeight = containerWidth * aspectRatio;

    // Apply constraints
    if (aspectRatio > 1) {
      // Portrait mode: limit to maxHeight
      calculatedHeight = Math.min(calculatedHeight, maxHeight);
    }
    // Landscape mode: use calculated height (no upper limit)

    setImageHeight(calculatedHeight);
    setImageLoading(false);
    setImageError(false);
  };

  const onImageError = (error: any) => {
    console.log('Image loading error:', error);
    setImageError(true);
    setImageLoading(false);
  };

  if (!base64Image || base64Image.trim() === '') {
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
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <Image
        source={{uri: `data:image/jpeg;base64,${base64Image}`}}
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
};

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
