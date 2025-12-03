import { describe, expect, test } from 'vitest';
import { basePath, siteDescription, siteTitle } from './siteMeta';

describe('site meta data', () => {
  test('Bookmarklet Exporter 用の基本情報を公開する', () => {
    expect(siteTitle).toBe('Bookmarklet Exporter');
    expect(siteDescription).toBe('Export bookmarklets into shareable files and snippets.');
    expect(basePath).toBe('/bookmarklet-exporter');
  });
});
