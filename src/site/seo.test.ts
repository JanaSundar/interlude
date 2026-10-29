import { describe, expect, it } from 'vite-plus/test';
import { items } from './items';
import { absoluteUrl } from './meta';
import { robotsTxt, sitemapXml, sitePaths } from './seo';

describe('seo', () => {
  it('lists the home page, every guide and every component once', () => {
    const paths = sitePaths();
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths[0]).toBe('/');
    expect(paths).toContain('/docs/components');
    for (const item of items) expect(paths).toContain(`/docs/components/${item.slug}`);
  });

  it('writes absolute, escaped sitemap urls', () => {
    const xml = sitemapXml(['/', '/docs/a&b']);
    expect(xml).toContain(`<loc>${absoluteUrl('/')}</loc>`);
    expect(xml).toContain('/docs/a&amp;b</loc>');
  });

  it('points robots.txt at the sitemap', () => {
    expect(robotsTxt()).toContain('Sitemap: ');
    expect(robotsTxt()).toMatch(/sitemap\.xml\n$/);
  });
});
