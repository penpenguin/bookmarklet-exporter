# Bookmarklet Exporter

Astro製の静的サイト。ブックマークレットを共有しやすい形でまとめるための土台です。  
GitHub Pages へのデプロイ Workflow を同梱しています。

## 必要条件
- Node.js 20 以上（CI も 20 を利用）
- npm

## スクリプト
- `npm run dev` : ローカル開発サーバー (http://localhost:4321)
- `npm run build` : `dist/` に静的ビルドを生成
- `npm run preview` : ビルド済みサイトのプレビュー
- `npm test -- --run` : Vitest（jsdom）でテストを実行（ウォッチなし）

## 設定のポイント
- `astro.config.mjs`  
  - `base` は `/bookmarklet-exporter`。リポジトリ名を変更したら合わせて更新してください。  
  - `PUBLIC_SITE_URL` 環境変数があれば `site` に利用します（なければ `https://example.github.io`）。
- サイトのタイトル/説明などは `src/lib/siteMeta.ts` に集約しています。

## GitHub Pages デプロイ
- ワークフロー: `.github/workflows/deploy.yml`
- `main` ブランチへの push または手動トリガーで実行
- Node 20 + `npm ci` でビルドし、`actions/deploy-pages@v4` で `github-pages` 環境へ公開
- `PUBLIC_SITE_URL` として `https://${{ github.repository_owner }}.github.io` を指定  
  独自ドメインや org サイトに合わせる場合はワークフローの環境変数を変更してください。

## TDD メモ
テストは Vitest + jsdom を採用しています。新規機能/バグ修正時は必ず失敗するテストから書き、Red → Green → Refactor の順で進めてください。
