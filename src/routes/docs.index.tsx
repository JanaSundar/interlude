import { createFileRoute } from '@tanstack/react-router';
import { GuidePage } from '@/site/docs/guide-page';
import { docPages } from '@/site/docs/pages';

const intro = docPages[0]!;

export const Route = createFileRoute('/docs/')({
  head: () => ({
    meta: [{ title: 'Docs — Interlude' }, { name: 'description', content: intro.description }],
  }),
  component: () => <GuidePage page={intro} />,
});
