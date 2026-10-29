import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { groups } from '@registry/catalog';
import { items } from '../items';
import { docPages } from './pages';

/** One entry in the docs: a guide page, the components overview, or a component. */
export type DocEntry =
  | { key: string; kind: 'page'; slug: string; title: string; section: string }
  | { key: string; kind: 'components'; title: string; section: string }
  | { key: string; kind: 'component'; slug: string; title: string; section: string };

export const pageKey = (slug: string) => `page:${slug}`;
export const componentKey = (slug: string) => `component:${slug}`;
export const COMPONENTS_KEY = 'components';

/**
 * Every docs entry in reading order: guides, then the components overview,
 * then each component grouped by purpose. The sidebar, the mobile picker
 * and previous/next all read this one list.
 */
export const docEntries: DocEntry[] = [
  ...docPages.map((p) => ({
    key: pageKey(p.slug),
    kind: 'page' as const,
    slug: p.slug,
    title: p.title,
    section: p.section,
  })),
  { key: COMPONENTS_KEY, kind: 'components', title: 'Overview', section: 'Components' },
  ...groups.flatMap((g) =>
    items
      .filter((i) => i.group === g.id)
      .map((i) => ({
        key: componentKey(i.slug),
        kind: 'component' as const,
        slug: i.slug,
        title: i.name,
        section: g.id,
      })),
  ),
];

/** Pure: the URL path of a docs entry; the inverse of docKeyFor. */
export const pathFor = (entry: DocEntry): string => {
  switch (entry.kind) {
    case 'page':
      return `/docs/${entry.slug}`;
    case 'components':
      return '/docs/components';
    case 'component':
      return `/docs/components/${entry.slug}`;
  }
};

/** Pure: the docs entry a pathname shows (the first guide for the bare /docs). */
export function docKeyFor(pathname: string): string {
  const [, , first, second] = pathname.replace(/\/+$/, '').split('/');
  if (!first) return docEntries[0]!.key;
  if (first !== 'components') return pageKey(first);
  return second ? componentKey(second) : COMPONENTS_KEY;
}

/** Pure: the entries either side of `key` in reading order. */
export function neighbours(key: string): { prev?: DocEntry; next?: DocEntry } {
  const i = docEntries.findIndex((e) => e.key === key);
  if (i < 0) return {};
  return { prev: docEntries[i - 1], next: docEntries[i + 1] };
}

/** A router link to any docs entry. */
export function DocLink({
  entry,
  className,
  current,
  label,
  children,
}: {
  entry: DocEntry;
  className?: string;
  current?: boolean;
  /** Accessible name when the visible content is only an icon. */
  label?: string;
  children: ReactNode;
}) {
  const shared = {
    className,
    // Exact matching: the router would otherwise mark the overview as the
    // current page on every component page beneath it.
    activeOptions: { exact: true, includeSearch: false },
    'aria-current': current ? ('page' as const) : undefined,
    'aria-label': label,
    title: label,
  };
  switch (entry.kind) {
    case 'page':
      return (
        <Link to="/docs/$page" params={{ page: entry.slug }} {...shared}>
          {children}
        </Link>
      );
    case 'components':
      return (
        <Link to="/docs/components" {...shared}>
          {children}
        </Link>
      );
    case 'component':
      return (
        <Link to="/docs/components/$slug" params={{ slug: entry.slug }} {...shared}>
          {children}
        </Link>
      );
  }
}
