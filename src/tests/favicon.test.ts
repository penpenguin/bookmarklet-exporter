import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('favicon', () => {
  it('ships a custom favicon branded for bookmarklet-exporter', () => {
    const svg = readFileSync('public/favicon.svg', 'utf-8');

    expect(svg).toContain('bookmarklet-exporter');
    expect(svg).toContain('<!-- bookmarklet-exporter -->');
  });
});
