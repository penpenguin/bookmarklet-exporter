import { describe, expect, it } from 'vitest';
import { normalize, wrapCode, simpleMinify, encodeMinimal, buildBookmarklet } from './transform';

describe('bookmarklet transform pipeline', () => {
  it('normalizes line endings, trims, and strips javascript: prefix', () => {
    const input = '  javascript:alert(1)\r\n\r\n// tail';
    const result = normalize(input);
    expect(result).toBe('alert(1)\n\n// tail');
  });

  it('wraps code with IIFE and async IIFE options', () => {
    expect(wrapCode('console.log(1);', 'iife')).toContain('(function(){');
    expect(wrapCode('await fetch()', 'async')).toContain('(async function(){');
  });

  it('simple minify collapses whitespace and strips comments', () => {
    const input = `
      // comment
      const a = 1;   /* inline */
      const b = a + 2;
    `;
    const output = simpleMinify(input);
    expect(output).toBe('const a = 1; const b = a + 2;');
  });

  it('minimal encode keeps symbols but encodes spaces and newlines', () => {
    const raw = '(function(){\n return 1 + 2;\n})();';
    const encoded = encodeMinimal(raw);
    expect(encoded).toBe('(function(){%20return%201%20+%202;%20})();');
  });

  it('buildBookmarklet runs full pipeline and adds javascript: prefix', async () => {
    const code = 'console.log("hi")';
    const { href, display } = await buildBookmarklet(code, {
      wrap: 'iife',
      minify: 'simple',
      encode: 'component',
      collapseNewlines: true,
    });
    expect(href.startsWith('javascript:')).toBe(true);
    expect(display).toContain('javascript:');
  });
});
