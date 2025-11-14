run();

function run() {
  const last = sessionStorage.getItem('__BM_last_csv');
  if (!last) { alert('直前のエクスポート結果が見つかりません'); return; }
  try {
    const { headers, rows } = JSON.parse(last);
    const key = '__BM_AGG__' + headers.join('\x1F');
    const exRaw = localStorage.getItem(key);
    const ex = exRaw ? JSON.parse(exRaw) : { headers: [], rows: [] };
    if (!ex.headers.length) ex.headers = headers;
    if (ex.headers.join('|') !== headers.join('|')) {
      alert('ヘッダが一致しません。別データとして保存します');
    }
    ex.rows = (ex.rows || []).concat(rows || []);
    localStorage.setItem(key, JSON.stringify(ex));
    alert(`追加しました。現在の件数: ${(ex.rows || []).length}`);
  } catch (e:any) {
    alert('追加中にエラー: ' + (e?.message || e));
  }
}
