import { docEntries, pathFor } from './docs/order';
import { absoluteUrl, SITE_URL } from './meta';

/** Every indexable path: the home page, then each docs entry in reading order. */
export const sitePaths = (): string[] => ['/', ...docEntries.map(pathFor)];

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Pure: a sitemap.xml document for the given paths. */
export const sitemapXml = (paths: readonly string[]): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((p) => `  <url><loc>${escapeXml(absoluteUrl(p))}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');

/** Pure: robots.txt that allows everything and points at the sitemap. */
export const robotsTxt = (): string =>
  ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_URL}/sitemap.xml`, ''].join('\n');
