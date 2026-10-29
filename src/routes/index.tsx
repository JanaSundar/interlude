import { createFileRoute } from '@tanstack/react-router';
import { DotMatrixLoader } from '@registry/components/interlude/dot-matrix-loader/dot-matrix-loader';
import { OrbitalLoader } from '@registry/components/interlude/orbital-loader/orbital-loader';
import { ProgressLoader } from '@registry/components/interlude/progress-loader/progress-loader';
import { PulseLoader } from '@registry/components/interlude/pulse-loader/pulse-loader';
import { SnakeLoader } from '@registry/components/interlude/snake/snake';
import { SectionLabel } from '@/site/chrome';
import { ComponentCard } from '@/site/component-card';
import { findItem, items } from '@/site/items';
import { Specimen } from '@/site/specimen';
import { InstallTabs } from '@/site/code';
import { ButtonLink } from '@/site/ui';

export const Route = createFileRoute('/')({ component: Home });

const strip = [
  { name: 'dot matrix', node: <DotMatrixLoader status="loading" size={22} /> },
  { name: 'orbital', node: <OrbitalLoader status="loading" size={26} /> },
  { name: 'pulse', node: <PulseLoader status="loading" size={26} /> },
  { name: 'progress', node: <ProgressLoader status="loading" size={96} /> },
  { name: 'snake · click it', node: <SnakeLoader status="loading" size={22} /> },
];

const principles = [
  [
    'Truthful state',
    'Components render the status your app supplies. Nothing completes, succeeds or cites on its own.',
  ],
  [
    'Yours to edit',
    'Installed as source with the shadcn CLI. Every file lands in your project, readable and changeable.',
  ],
  [
    'Accessible by default',
    'Keyboard paths, managed focus, polite announcements and real reduced-motion alternatives.',
  ],
  [
    'Motion with purpose',
    'Motion for React for state changes. High-frequency work stays out of React renders.',
  ],
] as const;

/** A small cross-section, tallest preview as the feature tile: decisions, status, play, waiting, activity. */
const featured = [
  'approval-gate',
  'thinking-indicator',
  'snake',
  'progress-loader',
  'agent-activity',
].map((slug) => findItem(slug)!);

function Home() {
  return (
    <>
      <section className="page grid items-center gap-12 pt-14 pb-20 sm:pt-20 md:gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="min-w-0">
          <SectionLabel index="00">Open-source React registry</SectionLabel>
          <h1 className="mt-6 text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
            Components
            <br />
            for the <span className="whitespace-nowrap text-faint">in-between.</span>
          </h1>
          <p className="mt-6 max-w-md text-[17px] md:max-w-xl md:text-lg leading-relaxed text-muted">
            Loaders that wait honestly, some with a game inside, and AI components that show what an
            agent actually did. Typed props, no provider lock-in, installed one at a time.
          </p>
          <InstallTabs item="agent-activity" className="mt-8 max-w-md md:max-w-xl" />
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink to="/docs/components" variant="solid">
              Browse components
            </ButtonLink>
            <ButtonLink to="/docs">Read the docs</ButtonLink>
          </div>
        </div>
        <Specimen />
      </section>

      <section aria-label="Loaders" className="relative dotted-t dotted-b">
        <div className="page">
          <ul className="grid grid-cols-2 sm:grid-cols-5">
            {strip.map((s) => (
              <li
                key={s.name}
                className="relative flex h-36 flex-col justify-between px-4 py-4 last:col-span-2 sm:last:col-span-1 sm:not-first:dotted-l"
              >
                <span className="grid flex-1 place-items-center">{s.node}</span>
                <span className="font-mono text-[11px] text-faint">{s.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="page py-24">
        <SectionLabel index="01">Components</SectionLabel>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Small, focused pieces. Each one installs on its own.
            </h2>
            <p className="mt-3 text-muted">
              {items.length} components for waiting, model status, agent activity, output and
              decisions, plus ten loaders with a game inside.
            </p>
          </div>
          <ButtonLink to="/docs/components" variant="solid">
            Browse components
          </ButtonLink>
        </div>
        {/* Bento: one tall feature tile beside a 2×2 block. */}
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:auto-rows-[19rem] lg:grid-cols-3">
          {featured.map((item, i) => (
            <li
              key={item.slug}
              className={i === 0 ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2' : ''}
            >
              <ComponentCard item={item} />
            </li>
          ))}
        </ul>
      </section>

      <section className="relative dotted-t">
        <div className="page py-24">
          <SectionLabel index="02">Principles</SectionLabel>
          <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map(([title, body]) => (
              <li key={title} className="relative dotted-t pt-4">
                <h3 className="font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
