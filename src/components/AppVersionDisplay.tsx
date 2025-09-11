import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import {useAppVersion} from '../hooks/useAppVersion';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';

interface AppVersionDisplayProps {
  showBuildNumber?: boolean;
  showPlatform?: boolean;
  showBundleId?: boolean;
  style?: any;
  textStyle?: any;
  onPress?: () => void;
  showLoading?: boolean;
}

/**
 * Component to display app version information
 */
const AppVersionDisplay: React.FC<AppVersionDisplayProps> = ({
  showBuildNumber = true,
  showPlatform = false,
  showBundleId = false,
  style,
  textStyle,
  onPress,
  showLoading = true,
}) => {
  const {versionInfo, loading, error, refetch} = useAppVersion();

  if (loading && showLoading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color={theme.COLORS.TEXT_GREY} />
        <Text style={[styles.text, styles.loadingText, textStyle]}>
          Loading version...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <Pressable
        style={[styles.container, styles.errorContainer, style]}
        onPress={onPress || refetch}>
        <Text style={[styles.text, styles.errorText, textStyle]}>
          Version: Error
        </Text>
        <Text style={[styles.text, styles.retryText, textStyle]}>
          Tap to retry
        </Text>
      </Pressable>
    );
  }

  if (!versionInfo) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.text, textStyle]}>Version: Unknown</Text>
      </View>
    );
  }

  const getVersionText = () => {
    let versionText = `v${versionInfo.version}`;

    if (showBuildNumber) {
      versionText += ` (${versionInfo.buildNumber})`;
    }

    if (showPlatform) {
      versionText += ` - ${versionInfo.platform.toUpperCase()}`;
    }

    if (showBundleId) {
      versionText += `\n${versionInfo.bundleId}`;
    }

    return versionText;
  };

  const Component = onPress ? Pressable : View;

  return (
    <Component
      style={[styles.container, style]}
      onPress={onPress}
      disabled={!onPress}>
      <Text style={[styles.text, textStyle]}>{getVersionText()}</Text>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 12,
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    textAlign: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 11,
  },
  retryText: {
    fontSize: 10,
    color: theme.COLORS.BTN_BG_BLUE,
    marginTop: 2,
  },
});

export default AppVersionDisplay;
