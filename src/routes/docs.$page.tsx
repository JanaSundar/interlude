import { createFileRoute, notFound } from '@tanstack/react-router';
import { GuidePage } from '@/site/docs/guide-page';
import { findDocPage } from '@/site/docs/pages';
import { pageHead } from '@/site/meta';
import { OG_DOCS, ogPath } from '@/site/og/names';

export const Route = createFileRoute('/docs/$page')({
  loader: ({ params }) => {
    if (!findDocPage(params.page)) throw notFound();
    return { slug: params.page };
  },
  head: ({ params }) => {
    const page = findDocPage(params.page);
    return pageHead({
      title: page?.title ?? 'Docs',
      description: page?.description,
      path: `/docs/${params.page}`,
      image: ogPath(OG_DOCS),
    });
  },
  component: DocPageRoute,
});

function DocPageRoute() {
  const { slug } = Route.useLoaderData();
  return <GuidePage page={findDocPage(slug)!} />;
}
