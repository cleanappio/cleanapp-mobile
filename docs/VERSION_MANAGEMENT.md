# App Version Management System

This document explains how to manage app versions consistently across Android and iOS platforms in the CleanApp project.

## 🎯 Overview

The version management system provides a single source of truth for app versions, ensuring consistency across all platforms and making it easy to display version information in the UI.

## 📁 File Structure

```
├── version.json                    # Single source of truth for versions
├── scripts/sync-version.js         # Version synchronization script
├── src/services/AppVersionService.js    # Service to access version info
├── src/hooks/useAppVersion.ts      # React hook for version info
├── src/components/AppVersionDisplay.tsx # UI component for version display
└── src/screens/VersionInfoScreen.tsx    # Example usage screen
```

## 🔧 Configuration

### version.json (Single Source of Truth)

```json
{
  "version": "3.2.8",
  "buildNumber": 21,
  "versionCode": 39,
  "description": "CleanApp version configuration - single source of truth for all platforms"
}
```

- **version**: The marketing version (e.g., "3.2.8")
- **buildNumber**: iOS build number / Android version code
- **versionCode**: Android-specific version code for Play Store

## 🚀 Usage

### 1. Display Version in UI

#### Simple Version Display

```tsx
import AppVersionDisplay from '../components/AppVersionDisplay';

// Basic version display
<AppVersionDisplay />

// With build number
<AppVersionDisplay showBuildNumber={true} />

// With platform info
<AppVersionDisplay
  showBuildNumber={true}
  showPlatform={true}
/>

// Clickable version
<AppVersionDisplay
  onPress={() => Alert.alert('Version', 'Info')}
  showBuildNumber={true}
/>
```

#### Using the Hook Directly

```tsx
import {useAppVersion} from '../hooks/useAppVersion';

const MyComponent = () => {
  const {versionInfo, loading, error, refetch} = useAppVersion();

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <Text>
      Version: {versionInfo?.version} ({versionInfo?.buildNumber})
    </Text>
  );
};
```

#### Using the Service Directly

```tsx
import AppVersionService from '../services/AppVersionService';

// Get specific version info
const version = await AppVersionService.getVersion();
const buildNumber = await AppVersionService.getBuildNumber();
const fullVersion = await AppVersionService.getFullVersionString();

// Get all version info
const allInfo = await AppVersionService.getAllVersionInfo();
```

### 2. Update Versions

#### Automatic Version Updates

```bash
# Patch version (3.2.8 -> 3.2.9)
npm run version:patch

# Minor version (3.2.8 -> 3.3.0)
npm run version:minor

# Major version (3.2.8 -> 4.0.0)
npm run version:major
```

#### Manual Version Updates

1. Edit `version.json`:

```json
{
  "version": "3.3.0",
  "buildNumber": 22,
  "versionCode": 40
}
```

2. Sync across platforms:

```bash
npm run sync-version
```

### 3. Version Synchronization

The sync script automatically updates:

- ✅ `package.json` version
- ✅ Android `build.gradle` (versionName, versionCode)
- ✅ iOS project (MARKETING_VERSION, CURRENT_PROJECT_VERSION)

## 📱 Platform-Specific Details

### Android

- **versionName**: Marketing version (e.g., "3.2.8")
- **versionCode**: Integer for Play Store (e.g., 39)

### iOS

- **MARKETING_VERSION**: Marketing version (e.g., "3.2.8")
- **CURRENT_PROJECT_VERSION**: Build number (e.g., 21)

## 🎨 UI Components

### AppVersionDisplay Props

| Prop              | Type      | Default | Description                      |
| ----------------- | --------- | ------- | -------------------------------- |
| `showBuildNumber` | boolean   | true    | Show build number in parentheses |
| `showPlatform`    | boolean   | false   | Show platform (iOS/Android)      |
| `showBundleId`    | boolean   | false   | Show bundle identifier           |
| `style`           | StyleProp | -       | Custom container style           |
| `textStyle`       | StyleProp | -       | Custom text style                |
| `onPress`         | function  | -       | Make version clickable           |
| `showLoading`     | boolean   | true    | Show loading indicator           |

### Example Styling

```tsx
<AppVersionDisplay
  style={{
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  }}
  textStyle={{
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  }}
  showBuildNumber={true}
  showPlatform={true}
/>
```

## 🔄 Workflow

### For New Releases

1. **Update version in `version.json`**:

```json
{
  "version": "3.3.0",
  "buildNumber": 22,
  "versionCode": 40
}
```

2. **Sync across platforms**:

```bash
npm run sync-version
```

3. **Update iOS pods** (if needed):

```bash
cd ios && pod install
```

4. **Build and test**:

```bash
# Android
npm run android

# iOS
npm run ios
```

### For Quick Version Bumps

```bash
# Patch version (3.2.8 -> 3.2.9)
npm run version:patch

# Minor version (3.2.8 -> 3.3.0)
npm run version:minor

# Major version (3.2.8 -> 4.0.0)
npm run version:major
```

## 🛠️ Troubleshooting

### Common Issues

1. **Version not syncing**: Run `npm run sync-version` manually
2. **iOS build issues**: Run `cd ios && pod install`
3. **Android build issues**: Clean and rebuild project
4. **Version display not updating**: Check if `react-native-device-info` is properly linked

### Verification

Check that versions are consistent:

```bash
# Check package.json
cat package.json | grep version

# Check Android
grep -A 2 "versionName\|versionCode" android/app/build.gradle

# Check iOS
grep -A 1 "MARKETING_VERSION\|CURRENT_PROJECT_VERSION" ios/CleanApp.xcodeproj/project.pbxproj
```

## 📋 Best Practices

1. **Always update `version.json` first** - it's the single source of truth
2. **Run `npm run sync-version`** after any version changes
3. **Test on both platforms** after version updates
4. **Use semantic versioning** (major.minor.patch)
5. **Increment build numbers** for each release
6. **Keep version codes unique** for Android Play Store

## 🎯 Integration Examples

### Settings Screen

```tsx
const SettingsScreen = () => {
  return (
    <View>
      <Text>Settings</Text>
      <AppVersionDisplay
        showBuildNumber={true}
        style={styles.versionContainer}
      />
    </View>
  );
};
```

### About Screen

```tsx
const AboutScreen = () => {
  const {versionInfo} = useAppVersion();

  return (
    <View>
      <Text>About CleanApp</Text>
      <Text>Version: {versionInfo?.version}</Text>
      <Text>Build: {versionInfo?.buildNumber}</Text>
      <Text>Platform: {versionInfo?.platform}</Text>
    </View>
  );
};
```

### Debug Information

```tsx
const DebugScreen = () => {
  const {versionInfo} = useAppVersion();

  return (
    <ScrollView>
      <Text>Debug Information</Text>
      <Text>App: {versionInfo?.appName}</Text>
      <Text>Version: {versionInfo?.fullVersionString}</Text>
      <Text>Bundle ID: {versionInfo?.bundleId}</Text>
      <Text>Platform: {versionInfo?.platform}</Text>
    </ScrollView>
  );
};
```

## 🔗 Dependencies

- `react-native-device-info`: For accessing native version information
- `react-native`: Core React Native framework

## 📚 Additional Resources

- [React Native Device Info Documentation](https://github.com/react-native-device-info/react-native-device-info)
- [Android Versioning Guide](https://developer.android.com/studio/publish/versioning)
- [iOS Versioning Guide](https://developer.apple.com/documentation/xcode/versioning-your-apps)
