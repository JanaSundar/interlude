import { createFileRoute, notFound } from '@tanstack/react-router';
import { GuidePage } from '@/site/docs/guide-page';
import { findDocPage } from '@/site/docs/pages';

export const Route = createFileRoute('/docs/$page')({
  loader: ({ params }) => {
    if (!findDocPage(params.page)) throw notFound();
    return { slug: params.page };
  },
  head: ({ params }) => {
    const page = findDocPage(params.page);
    return {
      meta: [
        { title: `${page?.title ?? 'Docs'} — Interlude` },
        ...(page ? [{ name: 'description', content: page.description }] : []),
      ],
    };
  },
  component: DocPageRoute,
});

function DocPageRoute() {
  const { slug } = Route.useLoaderData();
  return <GuidePage page={findDocPage(slug)!} />;
}
