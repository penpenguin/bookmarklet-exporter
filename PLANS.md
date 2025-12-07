## 0. 成功条件（最初に固定）

* [x] 生成物が **javascript: URL** と **ドラッグ可能リンク** の両方で提示される
* [x] 入力（JS/名前/オプション/最後のタブ）が **自動保存・復元** される
* [x] URL（hash/query）とタブが同期し **戻る/進む** でUI状態が戻る
* [x] 変換パイプラインが `normalize → wrap(任意) → minify(簡易/terser) → encode(軽量/URI)` で動作
* [x] 変換失敗・コピー失敗がユーザーに分かる形で表示される
* [x] **CDN不使用**（Monaco含め依存はnpmで同梱）
* [x] ビルド成果物が Astro SSG で静的ホスティングできる

---

## 1. 企画・設計（要件の確定）

* [x] 対象ブラウザ（Chrome/Edge/Firefox/Safari の最新2世代程度）を決める
* [x] 変換オプション仕様を確定  
  * [x] wrap：なし / IIFE / async IIFE の入力形式と出力形式
  * [x] minify：簡易（正規表現ベース等）と terser の切替条件
  * [x] encode：軽量（スペースのみ最小限エンコード）と encodeURIComponent の切替条件
* [x] 「ガイド」タブの内容範囲（使い方・注意点・FAQ）を決める
* [x] 保存キー設計（localStorage key `bookmarklet-exporter:v1`、将来のバージョン拡張方針）を決める
* [x] エラー表示方針（画面内ステータス）を決める
* [x] セキュリティ/注意喚起の文言方針（ブックマークレットの制約、自己責任、機密入力しない等）

---

## 2. プロジェクト初期化（Astro土台）

* [x] Astroプロジェクト作成（SSG前提）
* [x] TypeScript導入（tsconfig で strict）
* [x] Lint/Format（Astro check + 既存スタイルに準拠）
* [x] ルーティング設計（単一ページ）
* [x] ベースパス対応（`base: /bookmarklet-exporter`）確認
* [x] 静的アセット方針（favicon、OG 相当）整理

---

## 3. Monaco Editor 同梱（CDNなし・Worker含む）

* [x] Monacoをnpm依存で導入（`monaco-editor`）
* [x] Astro上でのマウント方式決定（Web Components から遅延ロード）
* [x] **Workerの同梱設定**  
  * [x] esbuild で `editor/json/ts.worker.js` をバンドル
  * [x] `MonacoEnvironment.getWorker` 設定
  * [x] ビルド後のパス解決（baseパス含め確認）
* [x] エディター要件実装  
  * [x] JavaScript言語モード  
  * [x] 行番号、ハイライト  
  * [x] フォーマット（Monaco / フォールバック trim）  
  * [x] 初期コード投入、変更イベント  
  * [x] `prefers-reduced-motion` を阻害しない

---

## 4. 変換パイプライン実装（中核ロジック）

* [x] `normalize` 実装（改行統一・javascript: 剥離）
* [x] `wrap` 実装（なし / IIFE / async IIFE）
* [x] `minify` 実装（簡易圧縮／terser 切替、例外処理）
* [x] `encode` 実装（軽量エンコード／encodeURIComponent）
* [x] `javascript:` URL生成（prefix 付与と注意喚起）
* [x] 変換の単体テスト用サンプル（文字列、async、例外）

---

## 5. UI（入力→出力→共有）

* [x] 画面レイアウト（入力/設定/出力の情報設計）
* [x] 入力項目：スニペット名、オプション（wrap/minify/encode）
* [x] 出力表示：javascript: URL テキストエリア＋ドラッグ可能リンク
* [x] コピー機能：Clipboard API + 非対応時フォールバック、結果メッセージ
* [x] ドラッグ機能の体験／ブックマークバーへのガイド

---

## 6. タブUI（ツール / ガイド）＋URL同期

* [x] タブのA11y実装（role, aria-selected, id/controls, キー操作）
* [x] URL同期（hash に統一、履歴対応、直リンク対応）
* [x] ガイドタブのコンテンツ実装（使い方、注意点）

---

## 7. 状態保存（localStorage）

* [x] 保存対象：コード、名前、オプション、最後のタブ
* [x] 保存タイミング：入力変更時にデバウンス
* [x] 復元：初回ロード時に復元、URL指定があればURL優先
* [x] 保存データのバージョニング（v1 キーで拡張余地）
* [x] 例外処理：localStorage不可時の扱い（try/catch で警告）

---

## 8. エラーハンドリング／メッセージ設計

* [x] 変換失敗を捕捉し可読な文言で表示
* [x] コピー不可時の文言と代替手順提示
* [x] “入力→生成→共有” の導線を止めない（入力保持）

---

## 9. アクセシビリティ & UX

* [x] フォーカス管理（タブ移動時、操作キー対応）
* [x] コントラスト、フォントサイズ、レスポンシブ
* [x] `prefers-reduced-motion` でアニメーション抑制
* [x] スクリーンリーダーで主要操作が可能（ラベル、ライブリージョン）

---

## 10. テスト（最低限ここまで）

* [x] 変換ロジックのユニットテスト（normalize/wrap/minify/encode）
* [x] 主要フローの統合テスト（jsdom で入力→生成→コピー、タブ操作、URL同期、localStorage復元）

---

## 11. ビルド／配信（SSG）

* [x] AstroのSSGビルドが通る
* [x] Monaco workerが本番で404にならない（baseパス含め確認）
* [x] 生成リンクが正しく動く（`javascript:` がHTML側で破壊されない）
* [x] デプロイ先（GitHub Pages を想定）の base 設定
* [x] キャッシュ方針（public/scripts はビルドごとに再生成する運用）

---

## 12. 仕上げ（ドキュメント・運用）

* [x] README：開発手順、ビルド、デプロイ、Monaco/worker注意点
* [x] ガイド文面：制限事項とトラブルシュート
* [x] ライセンス表記（依存は npm 同梱）
* [x] 変更履歴（当リビルドを PLANS へ反映）

---

1. 変換パイプライン（ロジック）→ 2) Monaco統合 → 3) 出力/コピー/ドラッグ → 4) タブURL同期 → 5) 保存/復元 → 6) A11y/テスト/配信 完了
