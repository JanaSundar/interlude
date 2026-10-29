import { useMemo, useState } from 'react';
import {
  Citation,
  SourceList,
  SourcesProvider,
} from '@registry/components/interlude/ai-sources/ai-sources';
import { GenerativeCard } from '@registry/components/interlude/generative-card/generative-card';
import {
  ResponseActions,
  type BuiltInAction,
} from '@registry/components/interlude/response-actions/response-actions';
import { StreamingMarkdown } from '@registry/components/interlude/streaming-markdown/streaming-markdown';
import { cards, runTimeline, sources } from '../fixtures';
import { useReplay, type Timed } from '../replay';
import { changed, expr, importLine, jsx } from './jsx';
import type { PlaygroundSpec, Values } from './playground';
import { useOnBump } from './use-on-bump';
import {
  isStill,
  accentControl,
  appearance,
  appearanceCode,
  appearanceDefaults,
  motionControl,
  snippet,
} from './shared';

function SourcesPreview({ values: v }: { values: Values }) {
  const list = sources.filter(
    (s) => (v.unavailable || !('unavailable' in s)) && (v.unsafe || s.id !== 'bad'),
  );
  return (
    <SourcesProvider
      sources={list}
      className="flex w-full max-w-md flex-col gap-4"
      {...appearance(v)}
    >
      <p className="text-[14px] leading-relaxed text-muted">
        Motion can turn off transform animations for people who ask for less motion
        <Citation id="motion" />, and status changes should be announced politely rather than moving
        focus
        <Citation id="wai" />.
        {v.missing && (
          <>
            {' '}
            This claim cites nothing that was retrieved
            <Citation id="made-up" />.
          </>
        )}
      </p>
      <SourceList title={String(v.title)} />
    </SourcesProvider>
  );
}

export const sourcesSpec: PlaygroundSpec = {
  controls: [
    { type: 'text', key: 'title', label: 'title' },
    { type: 'toggle', key: 'missing', label: 'cite a missing id' },
    { type: 'toggle', key: 'unavailable', label: 'include unavailable source' },
    { type: 'toggle', key: 'unsafe', label: 'include javascript: url' },
    accentControl,
    motionControl,
  ],
  defaults: {
    title: 'Sources',
    missing: true,
    unavailable: true,
    unsafe: true,
    ...appearanceDefaults,
  },
  examples: [
    {
      title: 'With problem sources',
      description: 'Missing, unavailable and unsafe entries are shown honestly.',
      values: {},
    },
    { title: 'Clean sources', values: { missing: false, unavailable: false, unsafe: false } },
  ],
  Preview: SourcesPreview,
  code: (v) =>
    snippet(
      importLine(['Citation', 'SourceList', 'SourcesProvider'], 'ai-sources'),
      jsx(
        'SourcesProvider',
        { sources: expr('retrieved'), ...appearanceCode(v) },
        `<p>\n  Motion respects reduced motion<Citation id="motion" />.\n</p>\n${jsx('SourceList', changed({ title: v.title }, { title: 'Sources' }))}`,
      ),
    ),
  note: 'Unknown citations render [?]; unsafe or unavailable links are never made clickable.',
};

const answer = runTimeline.filter((e) => e.value.type === 'text');

function MarkdownPreview({ values: v }: { values: Values }) {
  const pace = Number(v.pace);
  const timeline = useMemo<Timed<(typeof answer)[number]['value']>[]>(
    () => answer.map((e, i) => ({ at: 200 + i * pace, value: e.value })),
    [pace],
  );
  const still = isStill(v);
  const { released, done, playing, replay } = useReplay(timeline, { autoplay: !still });
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  useOnBump(v.replay, () => {
    setStoppedAt(null);
    replay();
  });
  useOnBump(v.stop, () => playing && setStoppedAt(released.length));
  const text = (still ? timeline.map((e) => e.value) : released)
    .slice(0, stoppedAt ?? undefined)
    .map((e) => (e.type === 'text' ? e.chunk : ''))
    .join('');
  return (
    <StreamingMarkdown
      className="w-full max-w-md"
      content={text}
      streaming={!still && !done && stoppedAt === null}
      stopped={stoppedAt !== null}
      {...appearance(v)}
    />
  );
}

export const markdownSpec: PlaygroundSpec = {
  controls: [
    {
      type: 'range',
      key: 'pace',
      label: 'ms per chunk',
      min: 20,
      max: 250,
      step: 10,
      format: (ms) => `${ms}ms`,
    },
    { type: 'action', key: 'replay', label: 'Replay stream' },
    { type: 'action', key: 'stop', label: 'Stop stream' },
    accentControl,
    motionControl,
  ],
  defaults: { pace: 70, replay: 0, stop: 0, ...appearanceDefaults },
  examples: [
    { title: 'Streaming', values: {} },
    { title: 'Fast stream', values: { pace: 25 } },
  ],
  Preview: MarkdownPreview,
  code: (v) =>
    snippet(
      importLine(['StreamingMarkdown'], 'streaming-markdown'),
      jsx('StreamingMarkdown', {
        content: expr('text'),
        streaming: expr('isStreaming'),
        stopped: expr('wasStopped'),
        ...appearanceCode(v),
      }),
    ),
  note: 'Scripted stream · raw HTML stays text; only the end of the stream is announced.',
};

type CardKey = keyof typeof cards;

function CardPreview({ values: v }: { values: Values }) {
  const [last, setLast] = useState<string | null>(null);
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <GenerativeCard
        key={String(v.example)}
        spec={cards[v.example as CardKey]}
        streaming={!!v.streaming}
        onAction={setLast}
        {...appearance(v)}
      />
      <p className="h-4 font-mono text-[11px] text-faint">{last && `onAction("${last}")`}</p>
    </div>
  );
}

export const cardSpec: PlaygroundSpec = {
  controls: [
    { type: 'choice', key: 'example', label: 'model output', options: Object.keys(cards) },
    { type: 'toggle', key: 'streaming', label: 'streaming' },
    accentControl,
    motionControl,
  ],
  defaults: { example: 'recommendation', streaming: false, ...appearanceDefaults },
  examples: [
    { title: 'Recommendation', values: {} },
    { title: 'Plan', values: { example: 'plan' } },
    { title: 'Comparison', values: { example: 'comparison' } },
    {
      title: 'Invalid output',
      description: 'Unknown blocks are skipped and the card explains why.',
      values: { example: 'invalid' },
    },
  ],
  Preview: CardPreview,
  code: (v) =>
    snippet(
      importLine(['GenerativeCard'], 'generative-card'),
      jsx('GenerativeCard', {
        spec: expr('modelJson'),
        streaming: v.streaming ? expr('isStreaming') : undefined,
        onAction: expr('(id) => handle(id)'),
        ...appearanceCode(v),
      }),
    ),
  note: 'Model JSON is validated against a fixed block contract. Try “invalid”.',
};

const builtIns: BuiltInAction[] = ['copy', 'regenerate', 'retry', 'edit', 'continue'];

function ActionsPreview({ values: v }: { values: Values }) {
  const [last, setLast] = useState<string | null>(null);
  const actions = builtIns.filter((a) => v[a]);
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="rounded-[14px] border border-line p-4 text-[14px]">
        <p className="text-muted">
          The test depends on the local timezone. Pin it in the setup file.
        </p>
        <ResponseActions
          className="mt-3 -ml-1.5"
          actions={actions}
          labels={!!v.labels}
          copyText="The test depends on the local timezone. Pin it in the setup file."
          onAction={setLast}
          accent={appearance(v).accent}
        />
      </div>
      <p className="h-4 font-mono text-[11px] text-faint">{last && `onAction("${last}")`}</p>
    </div>
  );
}

export const actionsSpec: PlaygroundSpec = {
  controls: [
    ...builtIns.map((a) => ({ type: 'toggle' as const, key: a, label: a })),
    { type: 'toggle', key: 'labels', label: 'labels' },
    accentControl,
  ],
  defaults: {
    copy: true,
    regenerate: true,
    retry: false,
    edit: true,
    continue: false,
    labels: false,
    accent: 'default',
  },
  examples: [
    { title: 'Icons', values: {} },
    { title: 'With labels', values: { labels: true } },
    {
      title: 'Error recovery',
      values: {
        copy: false,
        regenerate: false,
        edit: false,
        retry: true,
        continue: true,
        labels: true,
      },
    },
  ],
  Preview: ActionsPreview,
  code: (v) =>
    snippet(
      importLine(['ResponseActions'], 'response-actions'),
      jsx('ResponseActions', {
        actions: builtIns.filter((a) => v[a]),
        copyText: v.copy ? expr('answer') : undefined,
        labels: v.labels || undefined,
        onAction: expr('handle'),
        accent: appearanceCode(v).accent,
      }),
    ),
  note: 'Arrow keys, Home and End move between actions.',
};
