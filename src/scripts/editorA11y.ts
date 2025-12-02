/**
 * Ensure Monaco's hidden textarea (class="inputarea") has stable identifiers.
 * Adds `name` and optionally `id` when they are missing.
 */
export const ensureMonacoTextareaIdentifiers = (
  root: HTMLElement | null,
  options: { name?: string; id?: string } = {}
) => {
  if (!root) return;
  const textarea = root.querySelector<HTMLTextAreaElement>('textarea.inputarea');
  if (!textarea) return;

  const { name = 'code', id = 'monaco-code-input' } = options;

  if (!textarea.hasAttribute('name')) {
    textarea.setAttribute('name', name);
  }

  if (!textarea.id) {
    textarea.id = id;
  }
};
