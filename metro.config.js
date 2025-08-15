const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver alias for web platform
config.resolver.alias = {
  ...config.resolver.alias,
  // Alias react-native-maps to web stub on web platform
  ...(process.env.EXPO_PLATFORM === 'web' && {
    'react-native-maps': require.resolve('./web-stubs/react-native-maps.js'),
  }),
};

config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure platform-specific extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'];

// Add platform-specific resolver for web
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle react-native-maps on web
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: require.resolve('./web-stubs/react-native-maps.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle react-native-maps native imports on web
  if (platform === 'web' && moduleName === 'react-native/Libraries/Utilities/codegenNativeCommands') {
    return {
      filePath: require.resolve('./web-stubs/codegenNativeCommands.js'),
      type: 'sourceFile',
    };
  }
  
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;