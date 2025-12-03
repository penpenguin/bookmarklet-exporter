# Code Style & Conventions
- TypeScript/ESM project using Astro strict tsconfig; follow Astro/TypeScript module syntax.
- Favor test-driven development: add failing Vitest (jsdom) tests before implementing changes (Red → Green → Refactor).
- Site metadata centralized under `src/lib/siteMeta.ts`; update this file for title/description changes.
- Keep deployment settings consistent with `astro.config.mjs` (base `/bookmarklet-exporter`, `PUBLIC_SITE_URL` env support).
- Node.js 20 is the baseline runtime (locally and CI).