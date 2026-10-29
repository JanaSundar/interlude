/** An entry in the "On this page" outline, read from the rendered article. */
export type TocEntry = { id: string; text: string; level: 2 | 3 };

/** Pure: a stable, URL-safe anchor from heading text. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Reads the outline from headings that opted in with data-toc. */
export function readToc(root: ParentNode): TocEntry[] {
  return [...root.querySelectorAll<HTMLElement>('h2[data-toc][id], h3[data-toc][id]')].map((h) => ({
    id: h.id,
    text: h.dataset.toc || h.textContent || '',
    level: h.tagName === 'H3' ? 3 : 2,
  }));
}

/**
 * Pure: where the reading line sits in the viewport. It stays just under
 * the header until the last stretch of scroll (a screenful, or the whole
 * scroll on short pages), then slides to the bottom edge, so short final
 * sections that can never reach the top still get their turn, in order.
 */
export function readingLine(
  base: number,
  viewport: number,
  { remaining, scrollable }: { remaining: number; scrollable: number },
): number {
  const stretch = Math.min(viewport, scrollable);
  if (stretch <= 0 || remaining >= stretch) return base;
  const progress = 1 - Math.max(0, remaining) / stretch;
  return base + (viewport - base) * progress;
}

/** Pure: same outline, so a re-read doesn't disturb anything that depends on it. */
export const sameToc = (a: readonly TocEntry[], b: readonly TocEntry[]) =>
  a.length === b.length && a.every((e, i) => e.id === b[i]!.id && e.text === b[i]!.text);

/** Pure: which heading the reader is in: the last one whose top has passed the line. */
export function activeIndex(tops: readonly number[], line: number): number {
  if (tops.length === 0) return -1;
  let active = 0;
  tops.forEach((top, i) => {
    if (top <= line) active = i;
  });
  return active;
}
