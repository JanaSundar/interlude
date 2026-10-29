import { createFileRoute, notFound } from '@tanstack/react-router';
import { ComponentDocPage } from '@/site/docs/component-page';
import { findItem } from '@/site/items';
import { pageHead } from '@/site/meta';

export const Route = createFileRoute('/docs/components/$slug')({
  loader: ({ params }) => {
    if (!findItem(params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ params }) => {
    const item = findItem(params.slug);
    return pageHead({
      title: item?.name ?? 'Component',
      description: item?.description,
      path: `/docs/components/${params.slug}`,
    });
  },
  component: ComponentRoute,
});

function ComponentRoute() {
  const { slug } = Route.useLoaderData();
  return <ComponentDocPage key={slug} item={findItem(slug)!} />;
}
