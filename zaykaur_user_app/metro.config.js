const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure react-native-worklets resolves from project node_modules (fix for "Unable to resolve")
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-worklets': path.resolve(__dirname, 'node_modules/react-native-worklets'),
};

module.exports = config;
