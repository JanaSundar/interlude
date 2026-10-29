import { createFileRoute } from '@tanstack/react-router';
import { GuidePage } from '@/site/docs/guide-page';
import { docPages } from '@/site/docs/pages';
import { pageHead } from '@/site/meta';
import { OG_DOCS, ogPath } from '@/site/og/names';

const intro = docPages[0]!;

export const Route = createFileRoute('/docs/')({
  head: () =>
    pageHead({
      title: 'Docs',
      description: intro.description,
      path: '/docs/introduction',
      image: ogPath(OG_DOCS),
    }),
  component: () => <GuidePage page={intro} />,
});
