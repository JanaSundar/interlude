import { createFileRoute, notFound } from '@tanstack/react-router';
import { ComponentDocPage } from '@/site/docs/component-page';
import { findItem } from '@/site/items';

export const Route = createFileRoute('/docs/components/$slug')({
  loader: ({ params }) => {
    if (!findItem(params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ params }) => {
    const item = findItem(params.slug);
    return {
      meta: [
        { title: `${item?.name ?? 'Component'} — Interlude` },
        ...(item ? [{ name: 'description', content: item.description }] : []),
      ],
    };
  },
  component: ComponentRoute,
});

function ComponentRoute() {
  const { slug } = Route.useLoaderData();
  return <ComponentDocPage key={slug} item={findItem(slug)!} />;
}
