import { createFileRoute, Outlet } from '@tanstack/react-router';
import { DocsShell } from '@/site/docs/layout';

export const Route = createFileRoute('/docs')({
  component: () => (
    <DocsShell>
      <Outlet />
    </DocsShell>
  ),
});
