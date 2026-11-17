import { createFileRoute } from '@tanstack/react-router';
import { ogSpec } from '@/site/og/spec';
import { isTemplate, templateFor } from '@/site/og/templates';

/**
 * Open Graph cards, drawn by Takumi when asked: /og/home.png, /og/snake.png, …
 * Each page has a default design; /og/<template>/<name>.png previews another.
 */
export const Route = createFileRoute('/og/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const parts = (params._splat ?? '').replace(/\.png$/, '').split('/');
        const name = parts.pop() ?? '';
        const spec = parts.length <= 1 ? ogSpec(name) : null;
        const template = parts[0] ?? (spec && templateFor(name, spec));
        if (!spec || !template || !isTemplate(template)) {
          return new Response('Not found', { status: 404 });
        }
        // Loaded here so Takumi's native renderer stays out of the page bundle.
        const { renderOg } = await import('@/site/og/render');
        return renderOg(spec, template);
      },
    },
  },
});
