const js = require('@eslint/js');
const globals = require('globals');
const babelParser = require('@babel/eslint-parser');
const tsParser = require('@typescript-eslint/parser');

const noopRule = {
  meta: {
    schema: [],
  },
  create() {
    return {};
  },
};

const sharedGlobals = {
  ...globals.browser,
  ...globals.node,
  ...globals.jest,
  __DEV__: 'readonly',
  fetch: 'readonly',
  FormData: 'readonly',
  URLSearchParams: 'readonly',
};

const sharedRules = {
  'no-console': 'off',
  'no-unused-vars': 'off',
  'no-undef': 'off',
  'no-empty': 'off',
  'no-case-declarations': 'off',
  'no-async-promise-executor': 'off',
  'no-dupe-keys': 'off',
};

module.exports = [
  {
    ignores: [
      'android/**',
      'ios/**',
      'node_modules/**',
      'vendor/**',
      'fastlane/**',
      'coverage/**',
      '*.apk',
      '*.rej',
      '*.orig',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: [require.resolve('@react-native/babel-preset')],
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: sharedGlobals,
    },
    plugins: {
      'react-hooks': {
        rules: {
          'exhaustive-deps': noopRule,
          'rules-of-hooks': noopRule,
        },
      },
      'react-native': {
        rules: {
          'no-inline-styles': noopRule,
        },
      },
    },
    rules: sharedRules,
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: sharedGlobals,
    },
    plugins: {
      'react-hooks': {
        rules: {
          'exhaustive-deps': noopRule,
          'rules-of-hooks': noopRule,
        },
      },
      'react-native': {
        rules: {
          'no-inline-styles': noopRule,
        },
      },
    },
    rules: sharedRules,
  },
];
