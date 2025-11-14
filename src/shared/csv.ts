export const EOL = '\r\n';

export const clean = (s: any) => String(s ?? '').replace(/\s+/g, ' ').trim();

export const quote = (s: any) => `"${String(s ?? '').replace(/"/g, '""')}"`;

export const joinCsvLine = (cells: any[]) => cells.map(quote).join(',');

export function downloadCsv(filename: string, headers: string[] | null, rows: (string[])[]) {
  const lines: string[] = [];
  if (headers && headers.length) lines.push(joinCsvLine(headers));
  for (const r of rows) lines.push(joinCsvLine(r));
  const bom = '\uFEFF';
  const blob = new Blob([bom, lines.join(EOL)], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename.replace(/[\\/:*?"<>|]/g, '_');
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
}

export function saveLast(headers: string[], rows: (string[])[]) {
  try {
    sessionStorage.setItem('__BM_last_csv', JSON.stringify({ headers, rows }));
  } catch {}
}

export const pickDefaultFilename = (suffix: string) =>
  `${(document.title || (location.hostname as string) || 'export')}-${suffix}.csv`;
