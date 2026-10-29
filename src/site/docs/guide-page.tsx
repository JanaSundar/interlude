import { DocsLayout } from './layout';
import { pageKey } from './order';
import type { DocPage } from './pages';

/** A guide page in the docs layout. */
export function GuidePage({ page }: { page: DocPage }) {
  const { Body } = page;
  return (
    <DocsLayout
      current={pageKey(page.slug)}
      eyebrow={page.section}
      title={page.title}
      description={page.description}
    >
      <Body />
    </DocsLayout>
  );
}
