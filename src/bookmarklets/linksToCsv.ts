import { downloadCsv, saveLast, pickDefaultFilename } from '../shared/csv';
import { safeAbsUrl } from '../shared/dom';

run();

function run() {
  const anchors = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
  const mapped = anchors.map(a => ({
    text: (a.innerText && a.innerText.trim()) || (a.getAttribute('aria-label') || ''),
    href: safeAbsUrl(a.getAttribute('href') || ''),
    rel: a.rel || '',
    target: a.target || ''
  }));
  const uniq = new Map();
  for (const o of mapped) {
    if (!o.href) continue;
    const key = `${o.href}|${o.text.trim()}`;
    if (!uniq.has(key)) uniq.set(key, o);
  }
  const data = Array.from(uniq.values());
  if (!data.length) {
    alert('リンクが見つかりません');
    return;
  }
  const headers = ['text','href','rel','target'];
  const rows = data.map((o:any) => [o.text.trim(), o.href, o.rel, o.target]);
  const filename = pickDefaultFilename('links');
  downloadCsv(filename, headers, rows);
  saveLast(headers, rows);
}
