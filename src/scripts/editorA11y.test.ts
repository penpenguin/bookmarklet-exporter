import { describe, expect, it } from 'vitest';
import { ensureMonacoTextareaIdentifiers } from './editorA11y';

describe('ensureMonacoTextareaIdentifiers', () => {
  it('adds name and id to Monaco inputarea when missing', () => {
    const container = document.createElement('div');
    const textarea = document.createElement('textarea');
    textarea.className = 'inputarea';
    container.appendChild(textarea);

    ensureMonacoTextareaIdentifiers(container, { name: 'bookmarklet-code', id: 'monaco-code' });

    expect(textarea.getAttribute('name')).toBe('bookmarklet-code');
    expect(textarea.id).toBe('monaco-code');
  });

  it('does not override existing attributes', () => {
    const container = document.createElement('div');
    const textarea = document.createElement('textarea');
    textarea.className = 'inputarea';
    textarea.name = 'existing-name';
    textarea.id = 'existing-id';
    container.appendChild(textarea);

    ensureMonacoTextareaIdentifiers(container, { name: 'new-name', id: 'new-id' });

    expect(textarea.name).toBe('existing-name');
    expect(textarea.id).toBe('existing-id');
  });
});
