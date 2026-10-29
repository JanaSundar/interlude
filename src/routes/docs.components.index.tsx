import { createFileRoute, useNavigate } from '@tanstack/react-router';
import type { Group } from '@registry/catalog';
import { ComponentGrid, isGroup } from '@/site/component-grid';
import { DocsLayout } from '@/site/docs/layout';
import { COMPONENTS_KEY } from '@/site/docs/order';
import { items } from '@/site/items';
import { pageHead } from '@/site/meta';

export const Route = createFileRoute('/docs/components/')({
  validateSearch: (search): { group?: Group } => ({
    group: isGroup(search.group) ? search.group : undefined,
  }),
  head: () =>
    pageHead({
      title: 'Components',
      description: `${items.length} React components for loading states and AI interactions, each installable on its own with the shadcn CLI.`,
      path: '/docs/components',
    }),
  component: ComponentsIndex,
});

function ComponentsIndex() {
  const { group } = Route.useSearch();
  const navigate = useNavigate({ from: '/docs/components/' });
  return (
    <DocsLayout
      current={COMPONENTS_KEY}
      eyebrow="Components"
      title="Components"
      description={`${items.length} components, grouped by what they do. Each one installs on its own; open any to see its preview, code, examples and playground.`}
      wide
    >
      <ComponentGrid
        filter={group ?? 'all'}
        onFilterChange={(f) =>
          navigate({ search: { group: f === 'all' ? undefined : f }, replace: true })
        }
      />
    </DocsLayout>
  );
}
