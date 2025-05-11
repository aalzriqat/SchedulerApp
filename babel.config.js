module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 'expo-router/babel', // Deprecated, handled by babel-preset-expo
      // 'nativewind/babel' // Still disabled
    ],
  };
};
