import { describe, expect, it, beforeEach, vi } from 'vitest';

vi.mock('@monaco/bootstrap', () => {
  const mountMonaco = vi.fn(
    async (_host: HTMLElement, initial: string, _onChange: (v: string) => void) => ({
      dispose: vi.fn(),
      format: vi.fn(),
      getValue: () => initial,
      setValue: vi.fn(),
    }),
  );
  return { mountMonaco };
});

import { mountMonaco } from '@monaco/bootstrap';
import './studio';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('bookmarklet-studio component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    vi.useRealTimers();
  });

  it('generates javascript: URL and drag link', async () => {
    const el = document.createElement('bookmarklet-studio');
    document.body.appendChild(el);
    await flush();

    const codeField = el.querySelector<HTMLTextAreaElement>('[data-field="code"]');
    const convertBtn = el.querySelector<HTMLButtonElement>('[data-action="convert"]');
    const output = el.querySelector<HTMLElement>('bookmarklet-output');

    expect(codeField).toBeTruthy();
    codeField!.value = 'alert("hi")';
    convertBtn!.click();
    await flush();

    const text = output?.querySelector<HTMLTextAreaElement>('[data-role="output-text"]')?.value;
    const dragHref = output?.querySelector<HTMLAnchorElement>('[data-role="drag-link"]')?.getAttribute('href');

    expect(text).toContain('javascript:');
    expect(dragHref).toContain('javascript:');
  });

  it('saves inputs to localStorage and restores on next mount', async () => {
    vi.useFakeTimers();
    const first = document.createElement('bookmarklet-studio');
    document.body.appendChild(first);

    first.querySelector<HTMLInputElement>('[data-field="name"]')!.value = 'My Snippet';
    first.querySelector<HTMLTextAreaElement>('[data-field="code"]')!.value = 'console.log(42)';
    first.querySelector<HTMLSelectElement>('[data-field="wrap"]')!.value = 'async';
    first.querySelector<HTMLSelectElement>('[data-field="minify"]')!.value = 'simple';
    first.querySelector<HTMLSelectElement>('[data-field="encode"]')!.value = 'component';
    first.querySelector<HTMLInputElement>('[data-field="collapse"]')!.checked = true;
    first.dispatchEvent(new Event('input', { bubbles: true }));

    vi.advanceTimersByTime(400);
    vi.useRealTimers();

    const stored = JSON.parse(localStorage.getItem('bookmarklet-exporter:v1') || '{}');
    expect(stored.name).toBe('My Snippet');
    expect(stored.code).toContain('console.log');
    expect(stored.wrap).toBe('async');
    expect(stored.minify).toBe('simple');
    expect(stored.encode).toBe('component');
    expect(stored.collapse).toBe(true);

    // remount and expect values restored
    const second = document.createElement('bookmarklet-studio');
    document.body.appendChild(second);
    const restoredName = second.querySelector<HTMLInputElement>('[data-field="name"]')!.value;
    const restoredCode = second.querySelector<HTMLTextAreaElement>('[data-field="code"]')!.value;
    expect(restoredName).toBe('My Snippet');
    expect(restoredCode).toContain('console.log');
  });

  it('syncs tabs with URL hash and responds to hashchange', () => {
    const el = document.createElement('bookmarklet-studio');
    document.body.appendChild(el);

    const guideTab = el.querySelector<HTMLButtonElement>('[data-tab="guide"]')!;
    guideTab.click();
    expect(window.location.hash).toBe('#guide');

    window.location.hash = '#tools';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    const toolsTab = el.querySelector<HTMLButtonElement>('[data-tab="tools"]')!;
    expect(toolsTab.getAttribute('aria-selected')).toBe('true');
  });

  it('copies output via clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const el = document.createElement('bookmarklet-studio');
    document.body.appendChild(el);
    el.querySelector<HTMLTextAreaElement>('[data-field="code"]')!.value = 'alert(1)';
    el.querySelector<HTMLButtonElement>('[data-action="convert"]')!.click();
    await flush();

    el.querySelector<HTMLButtonElement>('[data-action="copy"]')!.click();
    expect(writeText).toHaveBeenCalled();
  });

  it('enables monaco automatically on mount', async () => {
    const el = document.createElement('bookmarklet-studio');
    document.body.appendChild(el);
    await flush();
    expect(mountMonaco).toHaveBeenCalled();
  });
});
