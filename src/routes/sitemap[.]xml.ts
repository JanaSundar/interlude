import { createFileRoute } from '@tanstack/react-router';
import { sitemapXml, sitePaths } from '@/site/seo';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () =>
        new Response(sitemapXml(sitePaths()), {
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        }),
    },
  },
});
