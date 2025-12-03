import { describe, expect, it } from 'vitest';
import { generateBookmarklet } from './bookmarklet';

describe('generateBookmarklet', () => {
  it('throws an error when code is empty after trim', () => {
    expect(() => generateBookmarklet('   ')).toThrow('code is required');
  });

  it('wraps code with IIFE and collapses newlines by default', () => {
    const result = generateBookmarklet('console.log("a")\nconsole.log("b")');

    expect(result).toBe('javascript:(function(){ console.log("a") console.log("b") })();');
  });

  it('keeps newlines when collapseNewlines is false', () => {
    const result = generateBookmarklet('alert(1);\nalert(2);', {
      wrapIIFE: true,
      collapseNewlines: false,
    });

    expect(result).toBe('javascript:(function(){ alert(1);\nalert(2); })();');
  });

  it('skips IIFE wrapping when wrapIIFE is false', () => {
    const result = generateBookmarklet('alert(1);', {
      wrapIIFE: false,
      collapseNewlines: true,
    });

    expect(result).toBe('javascript:alert(1);');
  });
});
