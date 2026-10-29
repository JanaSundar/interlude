import { safeUrl } from '../primitives/safe';

/** A reference your retrieval step actually returned. */
export type Source = {
  id: string;
  title?: string;
  /** Rendered as a link only when it is a valid http(s) URL. */
  url?: string;
  /** Shown when there is no URL, or to override the hostname. */
  domain?: string;
  description?: string;
  /** Quoted passage from the source, shown in the preview. */
  excerpt?: string;
  /** Mark a source your app could not load or verify. */
  unavailable?: boolean;
};

export type ResolvedSource = Source & {
  n: number;
  href: string | null;
  host: string | null;
  label: string;
};

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

/** Validates untrusted sources, numbers them, and decides what can honestly be linked. */
export function resolveSources(raw: readonly unknown[]): ResolvedSource[] {
  const seen = new Set<string>();
  const out: ResolvedSource[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const s = item as Record<string, unknown>;
    const id = str(s.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const url = safeUrl(s.url);
    const unavailable = s.unavailable === true;
    const host = str(s.domain) ?? url?.hostname.replace(/^www\./, '') ?? null;
    const title = str(s.title);
    out.push({
      id,
      title,
      url: str(s.url),
      domain: str(s.domain),
      description: str(s.description),
      excerpt: str(s.excerpt),
      unavailable,
      n: out.length + 1,
      href: unavailable ? null : (url?.href ?? null),
      host,
      label: title ?? host ?? 'Untitled source',
    });
  }
  return out;
}

export const sourceAnchor = (scope: string, id: string) =>
  `${scope}-src-${id.replace(/[^a-z0-9_-]/gi, '_')}`;
