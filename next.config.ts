import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export default (phase: string, { defaultConfig }: { defaultConfig: NextConfig }) => {
  // E2E mode enables source maps for coverage collection
  const isE2EMode = process.env.E2E_MODE === 'true'


  const nextConfig: NextConfig = {
    productionBrowserSourceMaps: isE2EMode,
    ...defaultConfig,
    experimental: {
      optimizePackageImports: ['react-icons'],
    },
    webpack: (config, { isServer }) => {
      if (isE2EMode) {
        // Enable source maps for production build coverage
        config.devtool = 'source-map'

        // Disable minification so coverage maps correctly to source
        config.optimization = {
          ...config.optimization,
          minimize: false,
        }

        // Fix server-side source map paths
        if (isServer) {
          config.output = {
            ...config.output,
            devtoolModuleFilenameTemplate: '[absolute-resource-path]',
          }
        }
      }
      return config
    },
  };
  if (phase !== PHASE_DEVELOPMENT_SERVER) {
    return { ...nextConfig, distDir: 'dist' };
  }

  return nextConfig;
};
