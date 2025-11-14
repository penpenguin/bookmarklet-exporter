export const norm = (s?: string | null) => String(s ?? '').replace(/\s+/g, ' ').trim();

export const innerText = (el: Element | null | undefined) => norm(el ? (el as HTMLElement).innerText : '');

export const safeAbsUrl = (href: string) => {
  try {
    return new URL(href, location.href).href;
  } catch {
    return href;
  }
};
