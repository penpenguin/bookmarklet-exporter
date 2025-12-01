// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
const basePath = '/bookmarklet-exporter';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://example.github.io',
  base: basePath,
});
