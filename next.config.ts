import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export default (phase: string, { defaultConfig }: { defaultConfig: NextConfig }) => {

  const nextConfig: NextConfig = {
    ...defaultConfig,
    experimental: {
      optimizePackageImports: ['react-icons'],
    },
    webpack: (config) => {
      return config;
    },
  };
  if (phase !== PHASE_DEVELOPMENT_SERVER) {
    return { ...nextConfig, distDir: 'dist' };
  }

  return nextConfig;
};
