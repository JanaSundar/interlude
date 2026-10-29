/**
 * Pure metadata for every registry item. The website and the registry.json
 * generator both read from here, so names, descriptions, docs and install
 * targets can't drift apart.
 */
/** What a component is for. One axis: loaders are AI-interface components too. */
export type Group = 'Waiting' | 'Status' | 'Activity' | 'Output' | 'Actions' | 'Playable';
export type Genre = 'arcade' | 'puzzle' | 'reflex';

export type CatalogEntry = {
  /** Registry item name and folder under registry/components/interlude. */
  slug: string;
  name: string;
  group: Group;
  /** Playable loaders only. */
  genre?: Genre;
  /** Primary export. */
  component: string;
  /** A few words for compact rows. */
  tagline: string;
  description: string;
  /** Shared registry item this one builds on. */
  base: typeof CORE_ITEM | typeof PRIMITIVES_ITEM;
  usage: string;
  a11y: string[];
  motion: string;
  /** Games only: what the loader becomes when clicked. */
  game?: string;
};

/**
 * The GitHub repository that serves this registry. The shadcn CLI installs
 * items as `owner/repo/item` and reads registry.json from the repo root.
 */
export const REPO = 'JanaSundar/interlude';

export const PRIMITIVES_ITEM = 'interlude-primitives';
export const CORE_ITEM = 'interlude-core';

const importFrom = (slug: string) => `@/components/interlude/${slug}/${slug}`;

const gameA11y = [
  'The loader is a real button: Enter or Space opens the game and moves focus into it.',
  'Escape closes the game and returns focus to the loader. Real-time games pause on blur and with P.',
  'Task status is announced politely; gameplay is never announced frame by frame.',
  'When the task ends, the game stops immediately and focus moves to the result.',
];
const gameMotion =
  'The loader dots morph into the game header through a shared layout transition. Gameplay runs on a fixed-step requestAnimationFrame loop outside React state; reduced motion keeps games playable but removes travel and flourish.';

type GameSeed = Pick<
  CatalogEntry,
  'slug' | 'name' | 'component' | 'tagline' | 'description' | 'game'
> & {
  genre: Genre;
};

const game = (seed: GameSeed): CatalogEntry => ({
  ...seed,
  group: 'Playable',
  base: CORE_ITEM,
  a11y: gameA11y,
  motion: gameMotion,
  usage: `import { ${seed.component} } from '${importFrom(seed.slug)}';

<${seed.component} active={isGenerating} label="Generating your response" />`,
});

const games: CatalogEntry[] = [
  game({
    slug: 'snake',
    name: 'Snake',
    component: 'SnakeLoader',
    genre: 'arcade',
    tagline: 'Eat, grow, wrap around',
    description: 'A short trail of dots pacing the border of a 4×4 matrix.',
    game: 'Snake on a 16×12 dot grid where the walls wrap around, with smooth movement, swipe and keyboard steering.',
  }),
  game({
    slug: 'falling-blocks',
    name: 'Falling Blocks',
    component: 'FallingBlocksLoader',
    genre: 'puzzle',
    tagline: 'Clear a line',
    description: 'Dots drop one column at a time, settle into a row, then clear.',
    game: 'An original falling-block puzzle with rotation kicks, line clears, scoring and a next-piece preview.',
  }),
  game({
    slug: 'pong',
    name: 'Pong',
    component: 'PongLoader',
    genre: 'arcade',
    tagline: 'First to five',
    description: 'One dot volleys across the middle row; the edges answer.',
    game: 'Single-player paddle rally against a beatable CPU, first to five.',
  }),
  game({
    slug: 'breakout',
    name: 'Breakout',
    component: 'BreakoutLoader',
    genre: 'arcade',
    tagline: 'Break the wall',
    description: 'A rising dot dims the top row one dot at a time.',
    game: 'Paddle, ball and a wall of bricks. Three lives, angle control from where you hit.',
  }),
  game({
    slug: 'merge-2048',
    name: '2048',
    component: 'Merge2048Loader',
    genre: 'puzzle',
    tagline: 'Merge your way up',
    description: 'Two dots slide together and fuse into one brighter dot.',
    game: 'A 4×4 merge puzzle with sliding tiles, merge rules, scoring, and win / no-moves detection.',
  }),
  game({
    slug: 'memory-match',
    name: 'Memory Match',
    component: 'MemoryMatchLoader',
    genre: 'puzzle',
    tagline: 'Find the pairs',
    description: 'Pairs of dots turn over together in a slow round.',
    game: 'Twelve cards, six dot glyphs. Flip, match, and finish in as few moves as you can.',
  }),
  game({
    slug: 'whack-a-mole',
    name: 'Whack-a-Mole',
    component: 'WhackAMoleLoader',
    genre: 'reflex',
    tagline: 'Twenty quick seconds',
    description: 'Dots pop up one by one in scattered positions.',
    game: 'A 20-second round of catching dots as they surface in a 3×3 grid.',
  }),
  game({
    slug: 'space-shooter',
    name: 'Space Shooter',
    component: 'SpaceShooterLoader',
    genre: 'arcade',
    tagline: 'Hold the line',
    description: 'A steady stream of dots rises from a still base.',
    game: 'Fly, fire, and hold off descending drones. Three lives; it speeds up over time.',
  }),
  game({
    slug: 'sliding-puzzle',
    name: 'Sliding Puzzle',
    component: 'SlidingPuzzleLoader',
    genre: 'puzzle',
    tagline: 'Put it back in order',
    description: 'A gap travels around a 3×3 ring as dots slide into it.',
    game: 'The 8-puzzle, shuffled by random legal moves so every board is solvable.',
  }),
  game({
    slug: 'dino-run',
    name: 'Dino Run',
    component: 'DinoRunLoader',
    genre: 'reflex',
    tagline: 'Jump the cacti',
    description: 'A dot runs the bottom row and hops each obstacle dot.',
    game: 'An endless runner in the spirit of the offline dino: one control, jump. Hold for a full hop, release early for a short one; the world speeds up the further you get.',
  }),
  game({
    slug: 'reaction-test',
    name: 'Reaction Test',
    component: 'ReactionTestLoader',
    genre: 'reflex',
    tagline: 'Wait for the signal',
    description: 'A ring charges, holds, and the centre flashes.',
    game: 'Wait for the signal, then react. Measured in milliseconds, with false-start detection.',
  }),
];

const loaderA11y = [
  'Announces the label politely while loading and the outcome when the task ends.',
  'The indicator itself is decorative (aria-hidden); state is always also given in words.',
  'Success, error and cancellation use distinct shapes, never colour alone.',
];
const loaderUsage = (
  component: string,
  slug: string,
  extra = '',
) => `import { ${component} } from '${importFrom(slug)}';

<${component} status={status} label="Uploading files"${extra} />`;

const indicators: CatalogEntry[] = [
  {
    slug: 'dot-matrix-loader',
    name: 'Dot Matrix',
    group: 'Waiting',
    component: 'DotMatrixLoader',
    tagline: 'The quiet default',
    description: 'A 3×3 matrix with a diagonal ripple. Accepts any pure dot pattern.',
    base: PRIMITIVES_ITEM,
    usage: loaderUsage('DotMatrixLoader', 'dot-matrix-loader'),
    a11y: loaderA11y,
    motion:
      'Every dot derives from one motion clock with useTransform, so the matrix never re-renders React while it runs. Reduced motion shows a still frame.',
  },
  {
    slug: 'orbital-loader',
    name: 'Orbital',
    group: 'Waiting',
    component: 'OrbitalLoader',
    tagline: 'Three nested orbits',
    description: 'Satellites on faint nested orbits, inner ones faster, around a solid core.',
    base: PRIMITIVES_ITEM,
    usage: loaderUsage('OrbitalLoader', 'orbital-loader'),
    a11y: loaderA11y,
    motion:
      'Positions come from a pure orbit function driven by useTime, outside React renders. Reduced motion parks the satellites.',
  },
  {
    slug: 'pulse-loader',
    name: 'Pulse',
    group: 'Waiting',
    component: 'PulseLoader',
    tagline: 'Breathing rings',
    description: 'A core with two rings breathing outward, half a beat apart.',
    base: PRIMITIVES_ITEM,
    usage: loaderUsage('PulseLoader', 'pulse-loader'),
    a11y: loaderA11y,
    motion:
      'Rings scale and fade on a staggered loop. Reduced motion removes the rings and shows a still core.',
  },
  {
    slug: 'progress-loader',
    name: 'Progress',
    group: 'Waiting',
    component: 'ProgressLoader',
    tagline: 'Real numbers or none',
    description:
      'Determinate when your app supplies a value, an honest indeterminate sweep when it doesn’t.',
    base: PRIMITIVES_ITEM,
    usage: loaderUsage(
      'ProgressLoader',
      'progress-loader',
      ' value={bytesSent} max={totalBytes} showValue',
    ),
    a11y: [
      'A native progressbar role with aria-valuenow only when progress is actually known.',
      ...loaderA11y.slice(0, 1),
      'Progress changes are exposed through the progressbar, not re-announced on every tick.',
    ],
    motion:
      'The bar springs to each new value; it never animates ahead of the number you supplied. The indeterminate sweep runs off one continuous clock; reduced motion shows a still, half-strength bar.',
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    group: 'Waiting',
    component: 'SkeletonGroup',
    tagline: 'Shape of what’s coming',
    description: 'Line, block and circle placeholders, plus a group that swaps them for content.',
    base: PRIMITIVES_ITEM,
    usage: `import { SkeletonGroup, SkeletonText } from '${importFrom('skeleton')}';

<SkeletonGroup loading={isLoading} label="Loading profile" placeholder={<SkeletonText lines={3} />}>
  <Profile user={user} />
</SkeletonGroup>`,
    a11y: [
      'Placeholders are hidden from assistive tech; the group exposes one named status instead.',
      'The region is marked aria-busy while loading.',
    ],
    motion: 'A single shimmer sweep per shape, as a transform. Content fades in when loading ends.',
  },
];

const ai: CatalogEntry[] = [
  {
    slug: 'thinking-indicator',
    name: 'Thinking Indicator',
    group: 'Status',
    component: 'ThinkingIndicator',
    tagline: 'What the model is doing',
    description:
      'Thinking, generating, streaming, waiting for a tool, paused or finished. A distinct dot pattern per state, plus words.',
    base: PRIMITIVES_ITEM,
    usage: `import { ThinkingIndicator } from '${importFrom('thinking-indicator')}';

<ThinkingIndicator state={run.state} tool={run.toolName} startedAt={run.startedAt} variant="detailed" />`,
    a11y: [
      'Announces state changes politely, once per change.',
      'Shows statuses, never fabricated “thoughts” or private reasoning.',
      'Elapsed time appears only when you pass a real start time.',
    ],
    motion:
      'Patterns crossfade between states and the label slides on change. Reduced motion holds a still frame.',
  },
  {
    slug: 'agent-activity',
    name: 'Agent Activity',
    group: 'Activity',
    component: 'AgentActivity',
    tagline: 'A truthful step log',
    description:
      'A chronological list of what an agent reported: searches, reads, tool calls, approvals. Handles duplicate and out-of-order events.',
    base: PRIMITIVES_ITEM,
    usage: `import { AgentActivity } from '${importFrom('agent-activity')}';

// Append raw events as they arrive; updates share an id.
<AgentActivity events={events} title="Working on your request" />`,
    a11y: [
      'An ordered list with each step’s status in words.',
      'Only step starts and endings are announced, never every update.',
      'Expandable details use a real button with aria-expanded and aria-controls.',
    ],
    motion:
      'New steps rise in, status icons swap with a spring, and details open with a height spring.',
  },
  {
    slug: 'tool-call-card',
    name: 'Tool Call',
    group: 'Activity',
    component: 'ToolCallCard',
    tagline: 'Arguments, result, timing',
    description:
      'One tool invocation with its arguments, status, duration and result or error. Secrets are masked.',
    base: PRIMITIVES_ITEM,
    usage: `import { ToolCallCard } from '${importFrom('tool-call-card')}';

<ToolCallCard name="search_docs" status={call.status} args={call.args} result={call.result} durationMs={call.ms} />`,
    a11y: [
      'The header is a disclosure button; it is disabled when there is nothing to expand.',
      'Status is announced when it changes and always shown in words.',
    ],
    motion: 'The status icon springs between states; the payload opens with a height spring.',
  },
  {
    slug: 'approval-gate',
    name: 'Approval Gate',
    group: 'Actions',
    component: 'ApprovalGate',
    tagline: 'Ask before acting',
    description:
      'Presents a proposed action for explicit approval or rejection. Shows an outcome only once your app confirms it.',
    base: PRIMITIVES_ITEM,
    usage: `import { ApprovalGate } from '${importFrom('approval-gate')}';

<ApprovalGate
  title="Delete 3 files"
  action="rm build/*.log"
  risk="high"
  status={approval.status}
  onApprove={() => runtime.approve(id)}
  onReject={(reason) => runtime.reject(id, reason)}
/>`,
    a11y: [
      'A labelled region; the decision buttons are disabled while a decision is in flight.',
      'After deciding, focus moves to the outcome so it is never dropped.',
      'Risk is written out, not only coloured.',
    ],
    motion:
      'The decision row swaps for the outcome with a short spring. A visual gate is not authorisation: enforce it on your server.',
  },
  {
    slug: 'ai-sources',
    name: 'Sources',
    group: 'Output',
    component: 'SourcesProvider',
    tagline: 'Citations you can check',
    description:
      'Numbered sources with inline citations and expandable excerpts. Unsafe or missing links are shown as text, never invented.',
    base: PRIMITIVES_ITEM,
    usage: `import { Citation, SourceList, SourcesProvider } from '${importFrom('ai-sources')}';

<SourcesProvider sources={retrieved}>
  <p>Motion respects reduced motion by default<Citation id="motion-docs" />.</p>
  <SourceList />
</SourcesProvider>`,
    a11y: [
      'Citations are links with a full accessible name (“Source 2: Title”).',
      'External links say they open in a new tab.',
      'A citation with no matching source renders as [?] rather than a guess.',
    ],
    motion: 'Rows rise in with a slight stagger; excerpts open with a height spring.',
  },
  {
    slug: 'streaming-markdown',
    name: 'Streaming Markdown',
    group: 'Output',
    component: 'StreamingMarkdown',
    tagline: 'Safe text as it arrives',
    description:
      'Renders a growing response as a safe Markdown subset: headings, lists, quotes, code and links. Raw HTML stays text.',
    base: PRIMITIVES_ITEM,
    usage: `import { StreamingMarkdown } from '${importFrom('streaming-markdown')}';

<StreamingMarkdown content={text} streaming={isStreaming} stopped={wasStopped} />`,
    a11y: [
      'aria-busy while streaming; only “Response complete” or “Response stopped” is announced.',
      'Tokens are never announced individually.',
    ],
    motion:
      'A single caret breathes at the end of the text while streaming; it holds still under reduced motion.',
  },
  {
    slug: 'generative-card',
    name: 'Generative Card',
    group: 'Output',
    component: 'GenerativeCard',
    tagline: 'Typed results, no HTML',
    description:
      'Summaries, plans, comparisons and recommendations from model JSON, through a validated block contract.',
    base: PRIMITIVES_ITEM,
    usage: `import { GenerativeCard } from '${importFrom('generative-card')}';

<GenerativeCard spec={modelJson} streaming={isStreaming} onAction={(id) => handle(id)} />`,
    a11y: [
      'Semantic structure per block: lists, definition lists, tables with headers.',
      'Invalid results explain what was skipped instead of failing silently.',
    ],
    motion:
      'Blocks rise in with a short stagger and the card resizes with layout animation as a stream fills it.',
  },
  {
    slug: 'response-actions',
    name: 'Response Actions',
    group: 'Actions',
    component: 'ResponseActions',
    tagline: 'Copy, retry, continue',
    description:
      'A compact toolbar for finished responses. Copy reports success only after the clipboard confirms it.',
    base: PRIMITIVES_ITEM,
    usage: `import { ResponseActions } from '${importFrom('response-actions')}';

<ResponseActions actions={['copy', 'regenerate', 'edit']} copyText={answer} onAction={handle} />`,
    a11y: [
      'role="toolbar" with arrow-key, Home and End navigation.',
      'Icon-only buttons have accessible names; copy results are announced.',
    ],
    motion: 'Icons swap with a quick spring on copy; presses compress slightly.',
  },
];

export const catalog: CatalogEntry[] = [...indicators, ...ai, ...games];

/** Display order and one-line purpose of each group. */
export const groups: { id: Group; blurb: string }[] = [
  { id: 'Waiting', blurb: 'Honest indicators while a task runs.' },
  { id: 'Status', blurb: 'What a model is doing right now.' },
  { id: 'Activity', blurb: 'Steps and tool calls an agent reported.' },
  { id: 'Output', blurb: 'Answers, sources and structured results.' },
  { id: 'Actions', blurb: 'Decisions and follow-ups for people.' },
  { id: 'Playable', blurb: 'Loaders with a game inside.' },
];

export const findEntry = (slug: string) => catalog.find((e) => e.slug === slug);
