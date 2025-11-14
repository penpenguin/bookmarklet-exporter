import { downloadCsv, saveLast, pickDefaultFilename } from '../shared/csv';

run();

function run() {
  let rowsSel = prompt('行のCSSセレクタ（例: .product-card, article, li）','article,li,.product,.card');
  if (rowsSel == null) return;
  const spec = prompt('列定義: 表示名:セレクタ[@属性] を | 区切り 例) タイトル:.title|価格:.price|URL:a@href','タイトル:h1,.title|URL:a@href|価格:.price');
  if (!spec) return;
  const cols = spec.split('|').map(s=>{
    const i = s.indexOf(':');
    if (i < 0) return null;
    const header = s.slice(0,i).trim();
    const sa = s.slice(i+1).trim();
    const j = sa.lastIndexOf('@');
    let selector = sa;
    let attr: string | null = null;
    if (j > 0) { selector = sa.slice(0,j).trim(); attr = sa.slice(j+1).trim(); }
    return { header, selector, attr };
  }).filter(Boolean) as {header:string,selector:string,attr:string|null}[];
  const rowEls = Array.from(document.querySelectorAll(rowsSel));
  if (!rowEls.length) { alert('行セレクタに一致する要素がありません'); return; }
  const clean = (s: any) => String(s ?? '').replace(/\s+/g, ' ').trim();
  const rows = rowEls.map(r => cols.map(c => {
    const el = (r as Element).querySelector(c.selector);
    let v = '';
    if (el) v = c.attr ? (el.getAttribute(c.attr) || '') : (el as HTMLElement).innerText;
    return clean(v);
  }));
  const headers = cols.map(c => c.header);
  const filename = pickDefaultFilename('custom');
  downloadCsv(filename, headers, rows);
  saveLast(headers, rows);
}
