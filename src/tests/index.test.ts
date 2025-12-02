import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('index page accessibility', () => {
  it('associates the JavaScript code label with a real form control', () => {
    const source = readFileSync('src/pages/index.astro', 'utf-8');
    const labelMatch = source.match(/<label[^>]*for="([^"]+)"[^>]*>JavaScript コード<\/label>/);

    expect(labelMatch?.[1]).toBe('code-fallback');

    const controlId = labelMatch?.[1] ?? '';
    const hasInput = new RegExp(`<input[^>]*id="${controlId}"`, 'm').test(source);
    const hasTextarea = new RegExp(`<textarea[^>]*id="${controlId}"`, 'm').test(source);

    expect(hasInput || hasTextarea).toBe(true);
  });

  it('gives the fallback textarea a name attribute for autofill compatibility', () => {
    const source = readFileSync('src/pages/index.astro', 'utf-8');
    const fallbackMatch = source.match(/<textarea[^>]*id="code-fallback"[^>]*>/);

    expect(fallbackMatch).not.toBeNull();

    const nameAttr = fallbackMatch?.[0].match(/name="([^"]*)"/)?.[1];
    expect(nameAttr).toBe('code');
  });

  it('sets autocomplete on the bookmark name input to avoid unwanted autofill', () => {
    const source = readFileSync('src/pages/index.astro', 'utf-8');
    const inputMatch = source.match(/<input[^>]*id="name-input"[^>]*>/);

    expect(inputMatch).not.toBeNull();

    const autocomplete = inputMatch?.[0].match(/autocomplete="([^"]*)"/)?.[1];
    expect(autocomplete).toBe('off');
  });

  it('renders tabs to switch between the tool and explanations with the tool active by default', () => {
    const source = readFileSync('src/pages/index.astro', 'utf-8');

    const toolTab = source.match(/<button[^>]*id="tab-tools"[^>]*role="tab"[^>]*>[^<]*ツール[^<]*<\/button>/);
    const guideTab = source.match(/<button[^>]*id="tab-guide"[^>]*role="tab"[^>]*>[^<]*説明[^<]*<\/button>/);

    expect(toolTab).not.toBeNull();
    expect(guideTab).not.toBeNull();

    const toolSelected = /<button[^>]*id="tab-tools"[^>]*aria-selected="true"/.test(source);
    expect(toolSelected).toBe(true);

    const guideHidden = /<div[^>]*id="guide-panel"[^>]*hidden/.test(source);
    expect(guideHidden).toBe(true);
  });

  it('does not render the hero eyebrow label', () => {
    const source = readFileSync('src/pages/index.astro', 'utf-8');
    expect(source.includes('BOOKMARKLET TOOL')).toBe(false);
  });

  it('does not include the phrase "1 ページで" in the hero title', () => {
    const source = readFileSync('src/pages/index.astro', 'utf-8');
    expect(source.includes('1 ページで')).toBe(false);
  });

  it('keeps tab ribbon and panel padding in sync via shared CSS vars', () => {
    const source = readFileSync('src/pages/index.astro', 'utf-8');
    const hasVarV = /--panel-pad-v:\s*clamp\(/.test(source);
    const hasVarH = /--panel-pad-h:\s*clamp\(/.test(source);
    expect(hasVarV && hasVarH).toBe(true);

    const tabShellPadding = /\.tab-shell\s*\{[^}]*padding:\s*var\(--panel-pad-v\) var\(--panel-pad-h\) var\(--panel-pad-v\) var\(--panel-pad-h\)/s.test(
      source,
    );
    const panelPadding = /\.panel-surface\s*\{[^}]*padding:\s*var\(--panel-pad-v\) var\(--panel-pad-h\) var\(--panel-pad-v\) var\(--panel-pad-h\)/s.test(
      source,
    );

    expect(tabShellPadding).toBe(true);
    expect(panelPadding).toBe(true);
  });
});
