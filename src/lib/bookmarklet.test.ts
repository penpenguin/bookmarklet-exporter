import { describe, expect, test } from 'vitest';
import {
  buildBookmarklet,
  type BuildOptions,
  normalizeCode,
} from './bookmarklet';

const baseInput = 'console.log("hi");';

describe('normalizeCode', () => {
  test('改行のみスペースに置き換える', () => {
    const code = 'a()\r\nb()\n  c()';
    expect(normalizeCode(code)).toBe('a() b()   c()');
  });

  test('空文字はそのまま返す', () => {
    expect(normalizeCode('')).toBe('');
  });
});

describe('buildBookmarklet', () => {
  const defaultOptions: BuildOptions = {
    wrapIife: false,
    singleLine: false,
    name: '',
  };

  test('空入力でエラーを返す', () => {
    const result = buildBookmarklet('', defaultOptions);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/コードを入力/);
  });

  test('そのままプレフィックス付きで生成する', () => {
    const result = buildBookmarklet(baseInput, defaultOptions);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bookmarklet).toBe(`javascript:${baseInput}`);
    expect(result.linkText).toBe('Bookmarklet');
  });

  test('IIFE でラップする', () => {
    const result = buildBookmarklet(baseInput, { ...defaultOptions, wrapIife: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bookmarklet).toBe('javascript:(function(){console.log("hi");})();');
  });

  test('改行を1行にまとめてから IIFE でラップする', () => {
    const code = 'alert("a")\nalert("b")';
    const result = buildBookmarklet(code, { ...defaultOptions, wrapIife: true, singleLine: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bookmarklet).toBe('javascript:(function(){alert("a") alert("b");})();');
  });

  test('名前があればリンクテキストに使う', () => {
    const result = buildBookmarklet(baseInput, { ...defaultOptions, name: 'Hello' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.linkText).toBe('Hello');
  });
});
