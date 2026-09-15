import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // konva's node entry tries to load the optional `canvas` package; everything here renders client-side
    config.externals = [...config.externals, { canvas: 'canvas' }];
    return config;
  },
};

export default nextConfig;
