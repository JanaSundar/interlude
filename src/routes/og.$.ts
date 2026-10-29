import { createFileRoute } from '@tanstack/react-router';
import { ogSpec } from '@/site/og/spec';

/** Open Graph cards, drawn by Takumi when asked: /og/home.png, /og/snake.png, … */
export const Route = createFileRoute('/og/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const spec = ogSpec(params._splat?.replace(/\.png$/, '') ?? '');
        if (!spec) return new Response('Not found', { status: 404 });
        // Loaded here so Takumi's native renderer stays out of the page bundle.
        const { renderOg } = await import('@/site/og/render');
        return renderOg(spec);
      },
    },
  },
});
