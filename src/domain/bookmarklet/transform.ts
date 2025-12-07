export type WrapMode = 'none' | 'iife' | 'async';
export type MinifyMode = 'none' | 'simple' | 'terser';
export type EncodeMode = 'minimal' | 'component';

export interface TransformOptions {
  wrap: WrapMode;
  minify: MinifyMode;
  encode: EncodeMode;
  collapseNewlines: boolean;
}

export interface TransformResult {
  href: string;
  display: string;
  encoded: string;
  wrapped: string;
}

/**
 * 改行を LF に統一し、両端の空白を除去する。
 * 入力に javascript: が含まれていれば削除する。
 */
export function normalize(input: string): string {
  const unified = input.replace(/\r\n?/g, '\n').trim();
  return unified.replace(/^javascript:\s*/i, '');
}

/**
 * wrap モードに応じてコードを包む。
 */
export function wrapCode(code: string, mode: WrapMode): string {
  if (mode === 'iife') {
    return `(function(){${code}\n})();`;
  }
  if (mode === 'async') {
    return `(async function(){${code}\n})();`;
  }
  return code;
}

/**
 * 壊れやすいが軽量な正規表現ベースの簡易圧縮。
 * コメントを削除し、連続する空白を 1 個にまとめる。
 */
export function simpleMinify(code: string): string {
  const withoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1');
  const collapsed = withoutComments.replace(/\s+/g, ' ').trim();
  return collapsed;
}

/**
 * 軽量エンコード: 改行をスペースに畳み、encodeURI で最小限エンコード。
 */
export function encodeMinimal(code: string): string {
  const compact = code.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
  return compact
    .replace(/ /g, '%20')
    .replace(/\t/g, '%20')
    .replace(/#/g, '%23');
}

/**
 * 変換パイプライン全体を実行し、javascript: URL を構築する。
 */
export async function buildBookmarklet(
  rawCode: string,
  options: TransformOptions,
): Promise<TransformResult> {
  const normalized = normalize(rawCode);
  const collapsed = options.collapseNewlines ? normalized.replace(/\s*\n\s*/g, ' ') : normalized;
  const wrapped = wrapCode(collapsed, options.wrap);

  let minified = wrapped;
  if (options.minify === 'simple') {
    minified = simpleMinify(wrapped);
  } else if (options.minify === 'terser') {
    const terser = await import('terser');
    const result = await terser.minify(wrapped, {
      ecma: 2020,
      compress: true,
      mangle: false,
    });
    if (!result.code) {
      throw new Error('Minify failed');
    }
    minified = result.code;
  }

  const encoded =
    options.encode === 'component' ? encodeURIComponent(minified) : encodeMinimal(minified);
  const href = `javascript:${encoded}`;

  return {
    href,
    display: href,
    encoded,
    wrapped: minified,
  };
}
