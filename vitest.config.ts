import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { playwright } from '@vitest/browser-playwright';
import { vitestPluginRSC } from 'vitest-plugin-rsc';
import { vitestPluginNext } from 'vitest-plugin-rsc/nextjs/plugin';

// Single config, three projects. Each project has its own Vite plugin stack so
// react-swc, vitest-plugin-rsc, and jsdom don't fight each other. Coverage
// aggregates across all projects into ./coverage/merged at the root.
export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      // v8 for the workspace roll-up. The plugin's virtual URLs
      // (about:/React/Server/...) used to crash v8 on Windows; patched via
      // patches/@vitest+coverage-v8+5.0.0-beta.2.patch (early-skip + try/catch
      // around fileURLToPath). Re-applied by patch-package on postinstall.
      provider: 'v8',
      reportsDirectory: './coverage/merged',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.browser.test.{ts,tsx}',
        'src/**/*.rsc.test.{ts,tsx}',
        'src/types/**',
      ],
      reporter: ['text', 'json', 'lcov', 'html'],
    },
    projects: [
      // 1) Unit tests — jsdom, fast, no browser.
      {
        plugins: [tsconfigPaths(), react()],
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: [
            'src/**/*.browser.test.{ts,tsx}',
            'src/**/*.rsc.test.{ts,tsx}',
          ],
        },
      },
      // 2) Client-component browser tests — vitest-browser-react + Playwright.
      {
        plugins: [tsconfigPaths(), react()],
        optimizeDeps: { include: ['vitest-browser-react'] },
        test: {
          name: 'component',
          globals: true,
          setupFiles: ['./vitest.browser.setup.ts'],
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
            viewport: { width: 1280, height: 800 },
          },
        },
      },
      // 3) RSC tests — vitest-plugin-rsc, three envs, Playwright.
      {
        plugins: [tsconfigPaths(), vitestPluginRSC(), vitestPluginNext()],
        esbuild: { jsx: 'automatic' },
        test: {
          name: 'rsc',
          globals: true,
          setupFiles: ['./vitest.rsc.setup.ts'],
          include: ['src/**/*.rsc.test.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
            viewport: { width: 1280, height: 800 },
          },
        },
      },
    ],
  },
});
