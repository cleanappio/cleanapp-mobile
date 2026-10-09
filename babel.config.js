module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        allowlist: [
          'APP_MODE', 'GEO_API_KEY', 'MAPBOX_ACCESS_TOKEN',
          'FCM_APPLICATION_ID', 'FCM_API_KEY', 'FCM_PROJECT_ID',
          'FCM_GCM_SENDER_ID', 'FCM_STORAGE_BUCKET',
        ],
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
