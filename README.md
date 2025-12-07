# Bookmarklet Exporter

JavaScript スニペットを `javascript:` URL と「ドラッグして登録できるリンク」に変換する Astro 製ワンページアプリです。UI は Web Components で構成し、タブ状態や入力値をローカルに保存します。

## 対応ブラウザ
- 最新の Chrome / Edge / Firefox / Safari（各最新 2 バージョン程度）を想定。
- クリップボード API が無い環境では自動で `execCommand('copy')` フォールバックが動作。

## 実装構成
- **SSG + Web Components**: `src/pages/index.astro` を静的生成し、`bookmarklet-studio` がタブ切替・イベント処理を担当。
- **変換パイプライン** (`src/domain/bookmarklet/transform.ts`)
  - normalize → wrap（none / IIFE / async IIFE）→ minify（none / simple / terser）→ encode（minimal / encodeURIComponent）
  - `terser` は高度圧縮を選択したときだけ動的 import。
- **Monaco 遅延ロード** (`src/monaco/bootstrap.ts`): ボタン操作で monaco-editor を読み込み、worker は同梱ビルドした `editor/json/ts.worker.js` を `MonacoEnvironment.getWorker` 経由で参照。失敗時は textarea フォールバック。
- **アクセシビリティ**: `role="tablist"` とキーボード操作 (←/→/Home/End/Enter/Space) 対応、`prefers-reduced-motion` でトランジション抑制。
- **永続化**: `localStorage` にコード/名称/オプション/タブを `bookmarklet-exporter:v1` として保存・復元（書き込みは 300ms デバウンス）。
- **URL 同期**: タブ切替時に `#tools` / `#guide` を履歴に積み、戻る/進むで UI 状態が復元。

## 使い方
1. コードを貼り付け、wrap/minify/encode オプションを選択。
2. 「変換する」で `javascript:` URL とドラッグ用リンクを生成。
3. 「生成結果をコピー」で Clipboard API へ書き込み（失敗時は手動コピー案内）。
4. ブックマークバーへリンクをドラッグして登録。入力内容とタブは自動保存されます。

## 開発とビルド
- 必要: Node.js 20 以上、npm。
- 開発サーバー: `npm run dev`（esbuild watch + Astro dev）。
- 本番ビルド: `npm run build`（`public/scripts/` にクライアント & worker を出力後、Astro SSG）。
- プレビュー: `npm run preview`
- テスト: `npm test -- --run`（Vitest jsdom）

### TDD フロー（Takuto Wada 流）
1. 失敗するテストを追加（`src/domain/*.test.ts`, `src/wc/*.test.ts`, `src/tests/*.test.ts`）。
2. 最小の実装でグリーン化。
3. 重複や命名をリファクタし、再度テストを回す。

## ディレクトリ
- `src/pages/` SSG ページ (`index.astro`)
- `src/layouts/` ベースレイアウト
- `src/wc/` Web Components とテンプレート
- `src/domain/bookmarklet/` 変換ロジック
- `src/monaco/` Monaco ローダーと worker エントリ
- `src/styles/` グローバルスタイル
- `src/tests/` Vitest セットアップと統合テスト

## 運用メモ
- 公開 URL は `PUBLIC_SITE_URL` または GitHub Pages のベース `/bookmarklet-exporter` を前提。
- 将来 `/howto` などルートを増やす場合は、`src/pages/` に追加し `BaseLayout` を流用する。
