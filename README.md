# bookmarklet-exporter

ブックマークレット（お気に入りに登録した JavaScript）を **ビルド時に生成** して出力する最小構成プロジェクトです。  
ページの **表/リンク/メタ/任意CSS抽出** を CSV に出力するスクリプトと、**ページ横断集計**（追加/出力）を同梱しています。

## セットアップ

```bash
# 任意のディレクトリで
npm i
npm run build
# dist/bookmarklets.html をブラウザで開く
```

- Node.js 18+ を想定
- 依存は `esbuild` のみ（開発時）

## 出力物

`dist/` に以下が生成されます：

- `*.iife.js` … ブックマークレットの IIFE バンドル（可読性が必要な場合に）
- `*.bookmarklet.txt` … ブックマーク登録用の `javascript:(()=>{...})()` 文字列
- `bookmarklets.html` … すぐ使えるリンク集（ドラッグ&ドロップでお気に入り登録）
- `bookmarklets.json` … メタ情報とコードのJSON

## 同梱ブックマークレット

- **テーブル→CSV**（`tableToCsv`）：ページ内の `<table>` をCSV化
- **リンク一覧→CSV**（`linksToCsv`）：`a[href]` のテキスト/URL/rel/target をCSV化
- **メタ/OGP/JSON-LD→CSV**（`metaToCsv`）：代表メタ情報を1行CSVに
- **CSS指定のカード抽出→CSV**（`cssExtractor`）：行セレクタと列定義で任意抽出
- **直近結果を集計に追加**（`aggAdd`）：`sessionStorage` → `localStorage` へ追記
- **集計CSV出力**（`aggExport`）：集計済みをCSVダウンロード（削除オプション）

> CSVはUTF-8+BOM/CRLF、セルはダブルクォートでエスケープされます。

## 使い方（HTML経由が簡単）

1. `npm run build`
2. `dist/bookmarklets.html` をブラウザで開く
3. 各リンクをブックマークバーへドラッグ&ドロップ

## カスタマイズ

- `src/bookmarklets/` 内の各 `.ts` を編集します。
- 新しいブックマークレットを追加する場合は、`scripts/build.mjs` の `entries` に追記してください。
- ビルドで自動的に `javascript:` 付きの1行コードとリンクHTMLが生成されます。

## 制約・注意

- ブラウザの拡張機能不要。ただし `chrome://` など一部の内部ページでは実行不可。
- クロスオリジン iframe 内のDOMにはアクセスできません（Same-Origin Policy）。
- SPAの遅延描画要素は、表示後に実行してください。

----

© 2025 MIT License
