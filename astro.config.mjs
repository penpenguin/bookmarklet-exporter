// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
const basePath = '/bookmarklet-exporter';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://example.github.io',
  base: basePath,
  vite: {
    resolve: {
      alias: {
        '@domain': '/src/domain',
        '@wc': '/src/wc',
        '@monaco': '/src/monaco',
        '@scripts': '/src/scripts',
        '@styles': '/src/styles',
      },
    },
    optimizeDeps: {
      exclude: ['monaco-editor'],
    },
    worker: {
      format: 'es',
    },
  },
});
