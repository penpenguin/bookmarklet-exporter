import { downloadCsv, joinCsvLine, saveLast, pickDefaultFilename } from '../shared/csv';
import { innerText } from '../shared/dom';

run();

function run() {
  try {
    const tables = Array.from(document.querySelectorAll('table'))
      .filter(t => (t as HTMLTableElement).tBodies.length || (t as HTMLTableElement).tHead) as HTMLTableElement[];
    if (!tables.length) {
      alert('テーブルが見つかりません');
      return;
    }
    let idx = 0;
    if (tables.length > 1) {
      const ans = prompt(`テーブルが${tables.length}個。番号(1〜${tables.length})?`, '1');
      if (ans == null) return;
      idx = parseInt(ans, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= tables.length) return;
    }
    const t = tables[idx];
    const headCells = t.tHead
      ? Array.from(t.tHead.querySelectorAll('th,td')).map(innerText)
      : t.tBodies[0] && t.tBodies[0].rows[0]
      ? Array.from(t.tBodies[0].rows[0].cells).map(innerText)
      : [];
    const startRow = t.tHead ? 0 : 1;
    const allRows = Array.from(t.rows);
    const data: string[][] = [];
    for (let r = startRow; r < allRows.length; r++) {
      const tr = allRows[r] as HTMLTableRowElement;
      if (tr.closest('thead')) continue;
      data.push(Array.from(tr.cells).map(innerText));
    }
    const filename = pickDefaultFilename(`table${idx + 1}`);
    downloadCsv(filename, headCells.length ? headCells : null, data);
    saveLast(headCells, data);
  } catch (e: any) {
    alert('エクスポート中にエラー: ' + (e?.message || e));
    console.error(e);
  }
}
