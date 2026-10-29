import { catalog } from '../../../registry/catalog';

/**
 * Which pages have an Open Graph card. Kept free of path aliases so the Vite
 * config can read it to pre-render one card per page.
 */
export const OG_HOME = 'home';
export const OG_DOCS = 'docs';

/** Pure: the URL path of a card. */
export const ogPath = (name: string) => `/og/${name}.png`;

/** Every name that has a card: home, docs, then each component. */
export const ogNames = (): string[] => [OG_HOME, OG_DOCS, ...catalog.map((e) => e.slug)];
