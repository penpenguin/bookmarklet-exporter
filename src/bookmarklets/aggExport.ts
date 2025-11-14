run();

function run() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('__BM_AGG__'));
  if (!keys.length) { alert('集計データがありません'); return; }
  let idx = 0;
  if (keys.length > 1) {
    let msg = '番号を選択:\n';
    keys.forEach((k,i) => {
      try {
        const o = JSON.parse(localStorage.getItem(k) || '{}');
        msg += `${i+1}: ${(o.headers||[]).join(', ')} (${(o.rows||[]).length}件)\n`;
      } catch { msg += `${i+1}: ${k}\n`; }
    });
    const ans = prompt(msg,'1');
    if (ans == null) return;
    idx = parseInt(ans,10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= keys.length) return;
  }
  const o = JSON.parse(localStorage.getItem(keys[idx]) || '{"headers":[],"rows":[]}');
  const EOL = '\r\n';
  const quote = (s:any)=>`"${String(s ?? '').replace(/"/g,'""')}"`;
  const headers: string[] = o.headers || [];
  const rows: string[][] = o.rows || [];
  const lines: string[] = [];
  if (headers.length) lines.push(headers.map(quote).join(','));
  for (const r of rows) lines.push(r.map(quote).join(','));
  const bom = '\uFEFF';
  const fn = `${(document.title || location.hostname)}-aggregate.csv`.replace(/[\\/:*?"<>|]/g,'_');
  const blob = new Blob([bom, lines.join(EOL)], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fn;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
  if (confirm('ダウンロード後に集計データを削除しますか？')) {
    localStorage.removeItem(keys[idx]);
  }
}
