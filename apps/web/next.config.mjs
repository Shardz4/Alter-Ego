/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rainbow-me/rainbowkit'],
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': 'localforage',
      'pino-pretty': false,  // Ignore optional logging pretty-printer in browser
    };
    return config;
  },
};

export default nextConfig;