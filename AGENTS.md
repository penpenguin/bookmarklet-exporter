# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/*.astro`: user-facing pages (`index`, `tools`, `guide`); keep page-specific copy and markup here.
- `src/lib`: shared logic (e.g., `bookmarklet.ts` transformer, `siteMeta.ts` metadata) with colocated tests.
- `src/scripts`: client bundle entry `main.ts` and editor accessibility helpers; built to `public/scripts/main.js`.
- `src/tests`: Vitest integration-style checks for Astro pages.
- `public/`: static assets (favicon, compiled JS). GitHub Pages workflow `.github/workflows/deploy.yml` publishes `dist/`.

## Build, Test, and Development Commands
- `npm run dev` – runs esbuild watch plus Astro dev server at http://localhost:4321.
- `npm run build` – bundles the client (esbuild) then runs `astro build` to `dist/`.
- `npm run preview` – serves the built site locally.
- `npm test` / `npm run test:watch` – Vitest (jsdom) suite; prefer `npm test -- --run` in CI-style runs.

## Coding Style & Naming Conventions
- TypeScript + ESM; 2-space indent; avoid `any`; prefer `const` and pure helpers under `src/lib`.
- Astro pages use kebab-case filenames; modules/tests mirror source names (`bookmarklet.ts` + `bookmarklet.test.ts`).
- No lint config yet—match existing formatting; keep strings ASCII unless UI copy requires Japanese.

## Testing Guidelines (TDD)
- Follow Takuto Wada TDD: Red → Green → Refactor in the smallest steps; add the failing Vitest first.
- Place unit tests next to code (`src/lib/*.test.ts`), page-level assertions in `src/tests`.
- Default environment is jsdom; cover new branches and DOM output; favor fast unit tests before adding E2E.

## Commit & Pull Request Guidelines
- Commit in small TDD steps; keep messages imperative with short prefixes (`feat:`, `fix:`, `docs:`) as seen in history.
- Each PR should describe the behavior change, list tests run (`npm test`), and link related issues; attach screenshots/gifs for UI tweaks.

## Communication & Configuration Notes
- プロジェクトに関する会話は原則日本語で。コードコメントやコミットメッセージは英語でも可。
- Use Node.js 20+. `PUBLIC_SITE_URL` may be set for canonical URLs; `astro.config.mjs` uses base `/bookmarklet-exporter`.
- Serena ツール群（シンボル検索、apply_patch など）を積極的に活用し、小さなステップで安全に変更を進める。
