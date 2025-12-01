export type BookmarkletOptions = {
  wrapIIFE?: boolean;
  collapseNewlines?: boolean;
};

export function generateBookmarklet(
  code: string,
  options: BookmarkletOptions = {},
): string {
  const trimmed = code.trim();

  if (!trimmed) {
    throw new Error('code is required');
  }

  const { wrapIIFE = true, collapseNewlines = true } = options;

  const singleLine = collapseNewlines
    ? trimmed.replace(/[\r\n]+/g, ' ')
    : trimmed;

  const wrapped = wrapIIFE ? `(function(){ ${singleLine} })();` : singleLine;

  return `javascript:${wrapped}`;
}
