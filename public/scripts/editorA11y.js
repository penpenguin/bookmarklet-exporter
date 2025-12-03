/**
 * Ensure Monaco's hidden textarea (class="inputarea") has stable identifiers.
 * Adds `name` and optionally `id` when they are missing.
 */
export const ensureMonacoTextareaIdentifiers = (root, options = {}) => {
  if (!root) return;
  const textarea = root.querySelector('textarea.inputarea');
  if (!textarea) return;

  const { name = 'code', id = 'monaco-code-input' } = options;

  if (!textarea.hasAttribute('name')) {
    textarea.setAttribute('name', name);
  }

  if (!textarea.id) {
    textarea.id = id;
  }
};
