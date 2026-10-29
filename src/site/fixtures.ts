import type { ActivityEvent } from '@registry/components/interlude/agent-activity/events';
import type { ThinkingState } from '@registry/components/interlude/thinking-indicator/thinking-indicator';
import { chunkText, type Timed } from './replay';

/**
 * One scripted agent run, as an event log. Everything the demos show is
 * derived from the prefix released so far. No model is called.
 */
export type RunEvent =
  | { type: 'thinking'; state: ThinkingState; tool?: string }
  | { type: 'activity'; event: ActivityEvent }
  | { type: 'text'; chunk: string };

export const prompt = 'Why does the checkout test fail on CI but pass locally?';

const answer = `The test depends on the **local timezone**. \`formatDate\` uses the runtime default, and CI runs in UTC.

- Locally the order date renders as *Oct 27*
- On CI it renders as *Oct 28*

Pin the zone in the test setup:

\`\`\`ts
process.env.TZ = 'America/New_York';
\`\`\``;

const act = (seq: number, event: Omit<ActivityEvent, 'seq'>): RunEvent => ({
  type: 'activity',
  event: { ...event, seq },
});

export const runTimeline: Timed<RunEvent>[] = [
  { at: 200, value: { type: 'thinking', state: 'thinking' } },
  {
    at: 700,
    value: act(1, {
      id: 's',
      kind: 'search',
      title: 'Search the codebase',
      target: '"checkout.test"',
      status: 'running',
    }),
  },
  {
    at: 1500,
    value: act(2, {
      id: 's',
      kind: 'search',
      title: 'Search the codebase',
      target: '"checkout.test"',
      status: 'completed',
      startedAt: 700,
      endedAt: 1500,
      detail: '2 matches: tests/checkout.test.ts, src/format.ts',
    }),
  },
  {
    at: 1600,
    value: act(3, {
      id: 'r',
      kind: 'read',
      title: 'Read file',
      target: 'src/format.ts',
      status: 'running',
    }),
  },
  {
    at: 2300,
    value: act(4, {
      id: 'r',
      kind: 'read',
      title: 'Read file',
      target: 'src/format.ts',
      status: 'completed',
      startedAt: 1600,
      endedAt: 2300,
    }),
  },
  { at: 2400, value: { type: 'thinking', state: 'tool', tool: 'run_tests' } },
  {
    at: 2400,
    value: act(5, {
      id: 't',
      kind: 'tool',
      title: 'Run tests with TZ=UTC',
      target: 'run_tests',
      status: 'running',
    }),
  },
  {
    at: 3600,
    value: act(6, {
      id: 't',
      kind: 'tool',
      title: 'Run tests with TZ=UTC',
      target: 'run_tests',
      status: 'failed',
      startedAt: 2400,
      endedAt: 3600,
      detail: 'Expected "Oct 27", received "Oct 28".',
    }),
  },
  { at: 3700, value: { type: 'thinking', state: 'streaming' } },
  ...chunkText(answer, 3800, 70).map((c) => ({
    at: c.at,
    value: { type: 'text', chunk: c.value } as RunEvent,
  })),
];

export type RunView = {
  thinking: ThinkingState | null;
  tool?: string;
  events: ActivityEvent[];
  text: string;
};

/** Pure fold of released run events into what the UI shows. */
export function viewRun(events: readonly RunEvent[], done: boolean): RunView {
  const view: RunView = { thinking: null, events: [], text: '' };
  for (const e of events) {
    if (e.type === 'thinking') {
      view.thinking = e.state;
      view.tool = e.tool;
    } else if (e.type === 'activity') view.events.push(e.event);
    else view.text += e.chunk;
  }
  if (done) view.thinking = 'completed';
  return view;
}

export const sources = [
  {
    id: 'motion',
    title: 'Accessibility · Motion for React',
    url: 'https://motion.dev/docs/react-accessibility',
    excerpt:
      'MotionConfig can disable transform and layout animations for users who prefer reduced motion.',
  },
  {
    id: 'wai',
    title: 'ARIA live regions',
    url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions',
    excerpt:
      'Live regions announce dynamic changes without moving focus. Use polite for non-urgent updates.',
  },
  { id: 'notes', title: 'Internal design notes', domain: 'wiki.local', unavailable: true },
  { id: 'bad', title: 'A link that was not safe to render', url: 'javascript:alert(1)' },
];

export const cards = {
  recommendation: {
    kind: 'recommendation',
    title: 'Use the Progress loader for uploads',
    subtitle: 'Your API reports bytes sent, so real progress is available.',
    blocks: [
      { type: 'metric', label: 'Median upload', value: '8.4s', note: 'from last 500 uploads' },
      {
        type: 'list',
        items: [
          'Determinate bar while bytes are known',
          'Falls back to an indeterminate sweep',
          'Announces only the outcome',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'For waits over 10 seconds, consider a playable loader.',
      },
    ],
    actions: [
      { id: 'install', label: 'Copy install command' },
      { id: 'compare', label: 'Compare options' },
    ],
  },
  plan: {
    kind: 'plan',
    title: 'Migrate the checkout flow',
    blocks: [
      {
        type: 'steps',
        steps: [
          { title: 'Pin the test timezone', done: true },
          {
            title: 'Move date formatting to the server',
            detail: 'Single source of truth for order dates',
          },
          { title: 'Remove the client fallback' },
        ],
      },
      {
        type: 'fields',
        fields: [
          { label: 'Owner', value: 'Payments' },
          { label: 'Estimate', value: '2 days' },
        ],
      },
    ],
  },
  comparison: {
    kind: 'comparison',
    title: 'Pick an indicator',
    blocks: [
      {
        type: 'comparison',
        columns: ['Dot Matrix', 'Progress', 'Snake'],
        rows: [
          { label: 'Known progress', values: ['No', 'Yes', 'No'] },
          { label: 'Best wait', values: ['< 3s', 'Any', '> 10s'] },
          { label: 'Playable', values: ['No', 'No', 'Yes'] },
        ],
      },
    ],
  },
  invalid: {
    title: 'Model returned markup',
    blocks: [
      { type: 'html', html: '<script>steal()</script>' },
      { type: 'list', items: [] },
    ],
  },
} as const;
