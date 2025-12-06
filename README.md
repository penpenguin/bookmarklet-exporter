# Bookmarklet Exporter

JavaScript スニペットを「ドラッグできるブックマークリンク」や `javascript:` URL に変換し、配布・共有を楽にするための Astro 製ワンページアプリです。Monaco Editor を使った編集体験と、フォールバック用テキストエリアの両方を備えています。  

## このアプリでできること
- JavaScript を貼り付けてブックマークレット用 URL を生成（IIFE ラップと改行折りたたみの ON/OFF 付き）
- 生成結果をコピー、またはそのままブックマークバーへドラッグして登録

## 必要条件
- Node.js 20 以上（CI も 20 を利用）
- npm

## スクリプト
- `npm run dev` : ローカル開発サーバー (http://localhost:4321)
- `npm run build` : `dist/` に静的ビルドを生成
- `npm run preview` : ビルド済みサイトのプレビュー
- `npm test -- --run` : Vitest（jsdom）でテストを実行（ウォッチなし）

