import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    pool: 'vmThreads',
    isolate: false,
    setupFiles: ['src/tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@wc': path.resolve(__dirname, 'src/wc'),
      '@monaco': path.resolve(__dirname, 'src/monaco'),
      '@scripts': path.resolve(__dirname, 'src/scripts'),
    },
  },
});
