import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { playwright } from '@vitest/browser-playwright';

// Unit (jsdom) and component (browser) tests run as two projects in one Vitest
// run, so Vitest merges their coverage into a single report. This needs
// @vitest/istanbul-lib-coverage >= 2.1.1 (pulled in by vitest >= 5.1.1 on a
// fresh install): older versions double-count statements in files covered by
// both projects.
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: './coverage/vitest',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.browser.test.{ts,tsx}',
        'src/types/**',
      ],
      reporter: ['text', 'json', 'lcov', 'html'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.browser.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        optimizeDeps: {
          include: ['vitest-browser-react'],
        },
        test: {
          name: 'component',
          setupFiles: ['./vitest.browser.setup.ts'],
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
          },
        },
      },
    ],
  },
});
