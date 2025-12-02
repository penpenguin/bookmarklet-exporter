# Project Overview
- **Purpose**: Static Astro site for sharing bookmarklets in an easy-to-export format. Includes GitHub Pages workflow for deployment.
- **Tech Stack**: Astro (TypeScript/JavaScript) with Node.js 20+, Vitest + jsdom for testing.
- **Structure**: `src/pages` for Astro pages, `src/lib` for shared utilities (e.g., `siteMeta.ts` for title/description), `src/scripts` for client scripts, `public/` for static assets, `.github/workflows/deploy.yml` for GitHub Pages deployment.
- **Configuration Highlights**: `astro.config.mjs` defines `base` as `/bookmarklet-exporter` and uses `PUBLIC_SITE_URL` for the `site` URL. `tsconfig.json` extends `astro/tsconfigs/strict`. GitHub Pages workflow publishes to `github-pages` environment using Node 20.
- **Guidelines**: Favor TDD; README instructs to write failing Vitest tests first (Red-Green-Refactor).