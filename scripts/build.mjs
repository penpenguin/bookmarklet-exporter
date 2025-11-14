import { build } from 'esbuild';
import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const outdir = 'dist';

const entries = [
  { name:'tableToCsv', file:'src/bookmarklets/tableToCsv.ts', title:'テーブル→CSV', desc:'ページ内の<table>を検出し、選択したテーブルをCSVとしてダウンロードします。' },
  { name:'linksToCsv', file:'src/bookmarklets/linksToCsv.ts', title:'リンク一覧→CSV', desc:'a[href]からテキスト/URL/rel/targetを収集しCSV化します（簡易重複排除）。' },
  { name:'metaToCsv', file:'src/bookmarklets/metaToCsv.ts', title:'メタ/OGP/JSON-LD→CSV', desc:'title/h1/meta/OGP/canonical/JSON-LD(Article系)を1行CSVにまとめます。' },
  { name:'cssExtractor', file:'src/bookmarklets/cssExtractor.ts', title:'CSS指定のカード抽出→CSV', desc:'行セレクタと列定義をプロンプトで指定して任意のカード/リストを抽出します。' },
  { name:'aggAdd', file:'src/bookmarklets/aggAdd.ts', title:'直近結果を集計に追加', desc:'sessionStorageの直近エクスポートをlocalStorageの集計に追記します。' },
  { name:'aggExport', file:'src/bookmarklets/aggExport.ts', title:'集計CSV出力', desc:'集計済みデータをCSVとしてダウンロードし、任意で集計を削除します。' }
];

async function buildAll() {
  await fs.mkdir(outdir, { recursive: true });
  const results = [];
  for (const entry of entries) {
    const result = await build({
      entryPoints: [entry.file],
      bundle: true,
      minify: true,
      platform: 'browser',
      target: ['es2018'],
      format: 'iife',
      write: false,
      legalComments: 'none'
    }).catch((e) => { console.error(e); process.exitCode = 1; });
    if (!result) continue;
    const code = result.outputFiles[0].text.trim();
    const iifePath = path.join(outdir, `${entry.name}.iife.js`);
    await fs.writeFile(iifePath, code, 'utf8');
    const bookmarklet = `javascript:${code}`;
    await fs.writeFile(path.join(outdir, `${entry.name}.bookmarklet.txt`), bookmarklet, 'utf8');
    results.push({ ...entry, code, bookmarklet });
  }
  const html = generateHtml(results);
  await fs.writeFile(path.join(outdir, 'bookmarklets.html'), html, 'utf8');
  await fs.writeFile(path.join(outdir, 'bookmarklets.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log(`Built ${results.length} bookmarklets to ${outdir}/`);
}

function generateHtml(items) {
  const escapeHtml = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>Bookmarklets Build Output</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;line-height:1.6}
code,pre,textarea{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace}
.card{border:1px solid #ddd;border-radius:8px;padding:1rem;margin:1rem 0}
a.bm{display:inline-block;padding:.4rem .7rem;border:1px solid #333;border-radius:6px;text-decoration:none}
small{color:#555}
textarea{width:100%;height:7rem}
</style>
</head>
<body>
<h1>ブックマークレット出力</h1>
<p>各リンクをブックマークバーへ<strong>ドラッグ&ドロップ</strong>してください。クリックするとこのページ上で実行されます。</p>
${items.map(it=>`
<div class="card">
  <h2>${it.title}</h2>
  <p><small>${it.desc || ''}</small></p>
  <p><a class="bm" href="${escapeHtml('javascript:' + it.code)}">${it.title}</a></p>
  <details><summary>コードを表示（コピー用）</summary>
    <p>Bookmarklet:</p>
    <textarea readonly>${escapeHtml('javascript:' + it.code)}</textarea>
    <p>IIFEバンドル:</p>
    <textarea readonly>${escapeHtml(it.code)}</textarea>
  </details>
</div>`).join('\n')}
<footer><p>生成日時: ${new Date().toISOString()}</p></footer>
</body>
</html>`;
}

await buildAll();

if (process.argv.includes('--watch')) {
  console.log('Watching for changes in src/ ...');
  try {
    fssync.watch('src', { recursive: true }, async () => {
      await buildAll();
    });
  } catch {
    console.log('fs.watch の再帰オプションが利用できません。手動で再実行してください。');
  }
}
