import type { ComponentType } from 'react';
import { AgentEvents, Accessibility, Security, Theming } from './pages-guides';
import { Installation, Introduction, TaskLifecycle } from './pages-start';

export type DocPage = {
  slug: string;
  title: string;
  description: string;
  section: 'Getting started' | 'Guides';
  Body: ComponentType;
};

/** Every docs page, in reading order. The sidebar, routes and prev/next all read this. */
export const docPages: DocPage[] = [
  {
    slug: 'introduction',
    title: 'Introduction',
    description: 'Components for the in-between: what Interlude is and how it’s organised.',
    section: 'Getting started',
    Body: Introduction,
  },
  {
    slug: 'installation',
    title: 'Installation',
    description: 'Add components from the GitHub registry with the shadcn CLI.',
    section: 'Getting started',
    Body: Installation,
  },
  {
    slug: 'task-lifecycle',
    title: 'Task lifecycle',
    description: 'How loaders render a task your app owns, from idle to its result.',
    section: 'Guides',
    Body: TaskLifecycle,
  },
  {
    slug: 'agent-events',
    title: 'Agent events',
    description: 'Feeding real agent activity into the AI components.',
    section: 'Guides',
    Body: AgentEvents,
  },
  {
    slug: 'theming',
    title: 'Theming',
    description: 'Tokens, light and dark, and per-instance overrides.',
    section: 'Guides',
    Body: Theming,
  },
  {
    slug: 'accessibility',
    title: 'Accessibility & motion',
    description: 'Announcements, keyboard paths and reduced motion.',
    section: 'Guides',
    Body: Accessibility,
  },
  {
    slug: 'security',
    title: 'Security',
    description: 'Treating model output and tool results as untrusted.',
    section: 'Guides',
    Body: Security,
  },
];

export const findDocPage = (slug: string) => docPages.find((p) => p.slug === slug);
