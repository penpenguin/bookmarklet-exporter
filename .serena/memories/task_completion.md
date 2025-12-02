# Task Completion Checklist
1. Ensure new functionality has accompanying Vitest (jsdom) coverage following TDD (write failing test, then implement, then refactor).
2. Run `npm run test` (or `npm test -- --run`) to verify all tests pass without watch.
3. Run `npm run build` if changes affect build output to confirm Astro can produce `dist/`.
4. When updating site metadata or deployment settings, verify `astro.config.mjs` and `src/lib/siteMeta.ts` stay consistent with repository name/base path.
5. Prepare changes for GitHub Pages workflow expectations (Node 20 environment, `PUBLIC_SITE_URL`).