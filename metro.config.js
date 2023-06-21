/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const extraNodeModules = require('node-libs-browser');
const {getDefaultConfig} = require('metro-config');

module.exports = (async () => {
  const {
    resolver: {sourceExts, assetExts},
  } = await getDefaultConfig();
  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    resolver: {
      extraNodeModules: {
        crypto: require.resolve('react-native-crypto'),
        fs: require.resolve('react-native-level-fs'),
        http: require.resolve('@tradle/react-native-http'),
        https: require.resolve('https-browserify'),
        net: require.resolve('react-native-tcp'),
        os: require.resolve('react-native-os'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        vm: require.resolve('vm-browserify'),
      },
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'js', 'json', 'ts', 'tsx', 'cjs', 'svg'],
    },
  };
})();
