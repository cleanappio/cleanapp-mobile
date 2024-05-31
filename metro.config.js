/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const {
  resolver: { sourceExts, assetExts },
} = getDefaultConfig(__dirname);

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
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
      zlib: require.resolve('react-zlib-js'),
    },
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);

// const extraNodeModules = require('node-libs-browser');
// const {getDefaultConfig} = require('@react-native/metro-config');

// module.exports = (async () => {
//   const {
//     resolver: {sourceExts, assetExts},
//   } = await getDefaultConfig();
//   return {
//     //resetCache: true,
//     transformer: {
//       babelTransformerPath: require.resolve('react-native-svg-transformer'),
//       getTransformOptions: async () => ({
//         transform: {
//           experimentalImportSupport: false,
//           inlineRequires: false,
//         },
//       }),
//     },
//     resolver: {
//       extraNodeModules: {
//         crypto: require.resolve('react-native-crypto'),
//         fs: require.resolve('react-native-level-fs'),
//         http: require.resolve('@tradle/react-native-http'),
//         https: require.resolve('https-browserify'),
//         net: require.resolve('react-native-tcp'),
//         os: require.resolve('react-native-os'),
//         path: require.resolve('path-browserify'),
//         stream: require.resolve('stream-browserify'),
//         vm: require.resolve('vm-browserify'),
//       },
//       assetExts: assetExts.filter((ext) => ext !== 'svg'),
//       sourceExts: [...sourceExts, 'js', 'json', 'ts', 'tsx', 'cjs', 'svg'],
//     },
//   };
// })();
