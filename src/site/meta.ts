import { catalog, REPO } from '@registry/catalog';

export { REPO };
/** How many loaders hide a game. */
export const GAME_COUNT = catalog.filter((e) => e.group === 'Playable').length;

export const REPO_URL = `https://github.com/${REPO}`;

export const packageManagers = ['pnpm', 'npm', 'yarn', 'bun'] as const;
export type PackageManager = (typeof packageManagers)[number];

const runners: Record<PackageManager, string> = {
  pnpm: 'pnpm dlx',
  npm: 'npx',
  yarn: 'yarn dlx',
  bun: 'bunx --bun',
};

/** shadcn resolves `owner/repo/item` straight from the repository's registry.json. */
export const installCommandFor = (pm: PackageManager, item: string) =>
  `${runners[pm]} shadcn@latest add ${REPO}/${item}`;

export const installCommand = (item: string) => installCommandFor('npm', item);

const adders: Record<PackageManager, string> = {
  pnpm: 'pnpm add',
  npm: 'npm install',
  yarn: 'yarn add',
  bun: 'bun add',
};

/** Adding an npm dependency, for manual installs. */
export const addDependencyFor = (pm: PackageManager, pkg: string) => `${adders[pm]} ${pkg}`;

export const sourceUrl = (path: string) => `${REPO_URL}/blob/main/${path}`;

/**
 * Canonical origin of the deployed site. Set VITE_SITE_URL when building for
 * a different domain; every canonical, Open Graph and sitemap URL follows it.
 */
export const SITE_URL = (
  import.meta.env?.VITE_SITE_URL ?? 'https://tryinterlude.vercel.app'
).replace(/\/+$/, '');

export const SITE_NAME = 'Interlude';
export const SITE_TAGLINE = 'Components for the in-between';
export const SITE_DESCRIPTION =
  'Open-source React components for loading states and AI interactions: honest loaders, hidden mini-games, agent activity, sources and approvals. Install one at a time.';

/** Pure: an absolute URL on this site for a path like `/docs/snake`. */
export const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`;

export const OG_IMAGE = { path: '/og.png', width: 1200, height: 630 };

/**
 * Pure: the head tags one page needs for search and sharing: title,
 * description, canonical link, Open Graph and Twitter card.
 */
export function pageHead({
  title,
  description = SITE_DESCRIPTION,
  path,
  noindex = false,
}: {
  /** Page title without the site name; omit for the home page. */
  title?: string;
  description?: string;
  path: string;
  noindex?: boolean;
}) {
  const full = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const url = absoluteUrl(path);
  const image = absoluteUrl(OG_IMAGE.path);
  return {
    meta: [
      { title: full },
      { name: 'description', content: description },
      ...(noindex ? [{ name: 'robots', content: 'noindex' }] : []),
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: full },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: String(OG_IMAGE.width) },
      { property: 'og:image:height', content: String(OG_IMAGE.height) },
      { property: 'og:image:alt', content: `${SITE_NAME}: ${SITE_TAGLINE}` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: full },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    links: [{ rel: 'canonical', href: url }],
  };
}
