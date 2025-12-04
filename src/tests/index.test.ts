import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('tools page', () => {
  it('associates the JavaScript code label with a real form control', () => {
    const source = readFileSync('src/pages/tools.astro', 'utf-8');
    const labelMatch = source.match(/<label[^>]*for="([^"]+)"[^>]*>JavaScript コード<\/label>/);

    expect(labelMatch?.[1]).toBe('code-fallback');

    const controlId = labelMatch?.[1] ?? '';
    const hasInput = new RegExp(`<input[^>]*id="${controlId}"`, 'm').test(source);
    const hasTextarea = new RegExp(`<textarea[^>]*id="${controlId}"`, 'm').test(source);

    expect(hasInput || hasTextarea).toBe(true);
  });

  it('gives the fallback textarea a name attribute for autofill compatibility', () => {
    const source = readFileSync('src/pages/tools.astro', 'utf-8');
    const fallbackMatch = source.match(/<textarea[^>]*id="code-fallback"[^>]*>/);

    expect(fallbackMatch).not.toBeNull();

    const nameAttr = fallbackMatch?.[0].match(/name="([^"]*)"/)?.[1];
    expect(nameAttr).toBe('code');
  });

  it('sets autocomplete on the bookmark name input to avoid unwanted autofill', () => {
    const source = readFileSync('src/pages/tools.astro', 'utf-8');
    const inputMatch = source.match(/<input[^>]*id="name-input"[^>]*>/);

    expect(inputMatch).not.toBeNull();

    const autocomplete = inputMatch?.[0].match(/autocomplete="([^"]*)"/)?.[1];
    expect(autocomplete).toBe('off');
  });

  it('exposes navigation links instead of JS-driven tabs', () => {
    const source = readFileSync('src/pages/tools.astro', 'utf-8');

    const declaresBase = /const\s+base\s*=\s*import\.meta\.env\.BASE_URL/.test(source);
    expect(declaresBase).toBe(true);

    const declaresTrim = /const\s+trimmedBase\s*=\s*base\s*===\s*'\/'\s*\?\s*''\s*:\s*base\.replace\(/.test(
      source,
    );
    expect(declaresTrim).toBe(true);

    const declaresToolsUrl = /const\s+toolsUrl\s*=\s*`\$\{trimmedBase\}\/tools`/.test(source);
    const declaresGuideUrl = /const\s+guideUrl\s*=\s*`\$\{trimmedBase\}\/guide`/.test(source);
    expect(declaresToolsUrl && declaresGuideUrl).toBe(true);

    const navLinkTools = /<a[^>]*href=\{[^}]*toolsUrl[^}]*\}[^>]*>/.test(source);
    const navLinkGuide = /<a[^>]*href=\{[^}]*guideUrl[^}]*\}[^>]*>/.test(source);

    expect(navLinkTools).toBe(true);
    expect(navLinkGuide).toBe(true);

    const lacksTabRole = /role="tab"/.test(source) === false;
    expect(lacksTabRole).toBe(true);
  });

  it('sets favicon href to include the base path', () => {
    const source = readFileSync('src/pages/tools.astro', 'utf-8');
    const pattern = /<link[^>]*rel="icon"[^>]*href=\{[^}]*faviconUrl[^}]*\}/s;
    expect(pattern.test(source)).toBe(true);

    const declaresBase = /const\s+base\s*=\s*import\.meta\.env\.BASE_URL/.test(source);
    expect(declaresBase).toBe(true);

    const trimsBase = /const\s+trimmedBase\s*=\s*base\s*===\s*'\/'\s*\?\s*''\s*:\s*base\.replace\(/.test(
      source,
    );
    expect(trimsBase).toBe(true);

    const buildsHref = /const\s+faviconUrl\s*=\s*`\$\{trimmedBase\}\/favicon\.svg`/.test(source);
    expect(buildsHref).toBe(true);
  });

  it('imports the client script URL from the TypeScript entry via Vite ?url', () => {
    const source = readFileSync('src/pages/tools.astro', 'utf-8');

    const importsScriptUrl = /import\s+mainScriptUrl\s+from\s+['"]\.\.\/scripts\/main\.ts\?url['"];/.test(source);
    expect(importsScriptUrl).toBe(true);

    const usesScriptSrc = /<script[^>]*type="module"[^>]*src=\{[^}]*mainScriptUrl[^}]*\}[^>]*><\/script>/s.test(source);
    expect(usesScriptSrc).toBe(true);

    const avoidsPublicAsset = /\/scripts\/main\.js/.test(source) === false;
    expect(avoidsPublicAsset).toBe(true);
  });

  it('prefetches the guide page for smoother navigation', () => {
    const source = readFileSync('src/pages/tools.astro', 'utf-8');

    const declaresGuideUrl = /const\s+guideUrl\s*=\s*`\$\{trimmedBase\}\/guide`/.test(source);
    expect(declaresGuideUrl).toBe(true);

    const hasPrefetch = /<link[^>]*rel="prefetch"[^>]*href=\{[^}]*guideUrl[^}]*\}[^>]*>/.test(source);
    expect(hasPrefetch).toBe(true);
  });

  it('styles scrollbars to look floating while keeping layout stable', () => {
    const source = readFileSync('src/pages/tools.astro', 'utf-8');

    const stableGutter = /body\s*\{[^}]*scrollbar-gutter:\s*stable\s+both-edges[^}]*\}/s.test(source);
    expect(stableGutter).toBe(true);

    const alwaysScroll = /html\s*\{[^}]*overflow-y:\s*scroll/s.test(source);
    expect(alwaysScroll).toBe(true);

    const webkitVisible = /::-webkit-scrollbar\s*\{[^}]*width:\s*8px[^}]*\}/s.test(source);
    expect(webkitVisible).toBe(true);

    const webkitTrackTransparent = /::-webkit-scrollbar-track\s*\{[^}]*background:\s*transparent[^}]*\}/s.test(source);
    expect(webkitTrackTransparent).toBe(true);

    const webkitThumbTint = /::-webkit-scrollbar-thumb\s*\{[^}]*background:[^;]*gradient[^}]*\}/s.test(source);
    expect(webkitThumbTint).toBe(true);

    const firefoxThin = /scrollbar-width:\s*thin;\s*scrollbar-color:\s*[^;]+\s+transparent;/s.test(source);
    expect(firefoxThin).toBe(true);
  });
});

describe('guide page', () => {
  it('renders static guidance content without loading the tool script', () => {
    const source = readFileSync('src/pages/guide.astro', 'utf-8');

    const hasHeading = /<h2>使い方<\/h2>/.test(source);
    expect(hasHeading).toBe(true);

    const noMainScript = /main\.ts/.test(source) === false;
    expect(noMainScript).toBe(true);
  });

  it('includes navigation links to the tool page', () => {
    const source = readFileSync('src/pages/guide.astro', 'utf-8');

    const declaresBase = /const\s+base\s*=\s*import\.meta\.env\.BASE_URL/.test(source);
    expect(declaresBase).toBe(true);

    const declaresTrim = /const\s+trimmedBase\s*=\s*base\s*===\s*'\/'\s*\?\s*''\s*:\s*base\.replace\(/.test(
      source,
    );
    expect(declaresTrim).toBe(true);

    const declaresToolsUrl = /const\s+toolsUrl\s*=\s*`\$\{trimmedBase\}\/tools`/.test(source);
    expect(declaresToolsUrl).toBe(true);

    const navLinkTools = /<a[^>]*href=\{[^}]*toolsUrl[^}]*\}[^>]*>/.test(source);
    expect(navLinkTools).toBe(true);
  });

  it('prefetches the tools page for smoother navigation', () => {
    const source = readFileSync('src/pages/guide.astro', 'utf-8');

    const declaresToolsUrl = /const\s+toolsUrl\s*=\s*`\$\{trimmedBase\}\/tools`/.test(source);
    expect(declaresToolsUrl).toBe(true);

    const hasPrefetch = /<link[^>]*rel="prefetch"[^>]*href=\{[^}]*toolsUrl[^}]*\}[^>]*>/.test(source);
    expect(hasPrefetch).toBe(true);
  });

  it('styles scrollbars to look floating while keeping layout stable', () => {
    const source = readFileSync('src/pages/guide.astro', 'utf-8');

    const stableGutter = /body\s*\{[^}]*scrollbar-gutter:\s*stable\s+both-edges[^}]*\}/s.test(source);
    expect(stableGutter).toBe(true);

    const alwaysScroll = /html\s*\{[^}]*overflow-y:\s*scroll/s.test(source);
    expect(alwaysScroll).toBe(true);

    const webkitVisible = /::-webkit-scrollbar\s*\{[^}]*width:\s*8px[^}]*\}/s.test(source);
    expect(webkitVisible).toBe(true);

    const webkitTrackTransparent = /::-webkit-scrollbar-track\s*\{[^}]*background:\s*transparent[^}]*\}/s.test(source);
    expect(webkitTrackTransparent).toBe(true);

    const webkitThumbTint = /::-webkit-scrollbar-thumb\s*\{[^}]*background:[^;]*gradient[^}]*\}/s.test(source);
    expect(webkitThumbTint).toBe(true);

    const firefoxThin = /scrollbar-width:\s*thin;\s*scrollbar-color:\s*[^;]+\s+transparent;/s.test(source);
    expect(firefoxThin).toBe(true);
  });
});

describe('shared layout', () => {
  it('uses the same hero heading and lead on tools and guide pages', () => {
    const tools = readFileSync('src/pages/tools.astro', 'utf-8');
    const guide = readFileSync('src/pages/guide.astro', 'utf-8');

    const toolsHeading = tools.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim();
    const guideHeading = guide.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim();
    expect(toolsHeading).toBe(guideHeading);

    const toolsLead = tools.match(/<p\s+class="lead"\s*>([\s\S]*?)<\/p>/)?.[1]?.trim();
    const guideLead = guide.match(/<p\s+class="lead"\s*>([\s\S]*?)<\/p>/)?.[1]?.trim();
    expect(toolsLead).toBe(guideLead);
  });
});
