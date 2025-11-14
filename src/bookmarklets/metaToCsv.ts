import { downloadCsv, saveLast, pickDefaultFilename } from '../shared/csv';

run();

function run() {
  const m = (name: string) => (document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null)?.content || '';
  const p = (prop: string) => (document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null)?.content || '';
  const canonical = (document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null)?.href || location.href;
  const h1 = (document.querySelector('h1') as HTMLElement | null)?.innerText || '';
  const lds = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).flatMap((s)=> {
    try {
      const j = JSON.parse(s.textContent || 'null');
      return Array.isArray(j) ? j : [j];
    } catch { return [] as any[]; }
  });
  const findType = (types: string[]) => lds.find((x:any) => {
    const t = ([] as string[]).concat(x?.['@type'] || []).join(',');
    return types.some(tt => t.includes(tt));
  });
  const art: any = findType(['Article','NewsArticle','BlogPosting']) || null;
  const authors = art ? (() => {
    const a = art.author;
    if (Array.isArray(a)) return a.map((v:any) => (v && (v.name || v['@id'])) || v).join('|');
    return (a && (a.name || a['@id'])) || a || '';
  })() : '';
  const fields: Record<string, string> = {
    'page.title': document.title,
    'page.h1': h1,
    'meta.description': m('description'),
    'og.title': p('og:title'),
    'og.description': p('og:description'),
    'og.type': p('og:type'),
    'og.url': p('og:url') || canonical,
    'og.image': p('og:image'),
    'canonical': canonical,
    'ld.@type': art ? ([] as string[]).concat(art['@type'] || []).join('|') : '',
    'ld.headline': art?.headline || '',
    'ld.author': authors,
    'ld.datePublished': art?.datePublished || '',
    'ld.dateModified': art?.dateModified || '',
    'ld.publisher': art?.publisher?.name || '',
    'ld.url': art?.url || ''
  };
  const headers = Object.keys(fields);
  const rows = [headers.map(h => String(fields[h] ?? '').replace(/\s+/g,' ').trim())];
  const filename = pickDefaultFilename('meta');
  downloadCsv(filename, headers, rows);
  saveLast(headers, rows);
}
