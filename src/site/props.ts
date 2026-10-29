/** Prop reference per component, mirroring the typed props in the registry source. */
export type PropDoc = { name: string; type: string; default?: string; description: string };

const shared = {
  accent: {
    name: 'accent',
    type: 'string',
    default: 'var(--interlude-accent)',
    description: 'Any CSS colour.',
  },
  reducedMotion: {
    name: 'reducedMotion',
    type: "'user' | 'always' | 'never'",
    default: "'user'",
    description: 'user follows the OS preference.',
  },
  className: { name: 'className', type: 'string', description: 'Classes for the root element.' },
} satisfies Record<string, PropDoc>;

const statusLoader: PropDoc[] = [
  {
    name: 'status',
    type: "'idle' | 'loading' | 'success' | 'error' | 'cancelled'",
    description: 'Task status owned by your app. Takes precedence over active.',
  },
  {
    name: 'active',
    type: 'boolean',
    description: 'Shorthand: true is loading, false is idle (renders nothing).',
  },
  { name: 'label', type: 'string', description: 'What the task is doing. Shown and announced.' },
  { name: 'size', type: 'number', description: 'Indicator size in px.' },
  {
    name: 'speed',
    type: 'number',
    default: '1',
    description: 'Animation speed, clamped to 0.5–2.',
  },
  {
    name: 'result',
    type: 'ReactNode | (status) => ReactNode',
    default: 'status line',
    description: 'Rendered once the task ends.',
  },
  shared.accent,
  shared.reducedMotion,
  shared.className,
];

const gameLoader: PropDoc[] = [
  ...statusLoader.slice(0, 4),
  {
    name: 'speed',
    type: 'number',
    default: '1',
    description: 'Loader and game speed, clamped to 0.5–2.',
  },
  {
    name: 'discovered',
    type: 'boolean',
    description: 'Controlled discovery. Only has an effect while loading.',
  },
  {
    name: 'onDiscoveredChange',
    type: '(discovered: boolean) => void',
    description: 'Called when the user opens or closes the game.',
  },
  {
    name: 'hint',
    type: 'boolean',
    default: 'false',
    description: 'Keep the faint “play” hint visible.',
  },
  {
    name: 'seed',
    type: 'number',
    default: 'random',
    description: 'Fixed seed for deterministic boards.',
  },
  ...statusLoader.slice(5),
];

export const propsFor: Record<string, PropDoc[]> = {
  'dot-matrix-loader': [
    ...statusLoader,
    {
      name: 'pattern',
      type: 'DotPattern',
      default: 'ripple',
      description: 'Any pure (phase, col, row) => frame pattern.',
    },
  ],
  'orbital-loader': statusLoader,
  'pulse-loader': statusLoader,
  'progress-loader': [
    {
      name: 'value',
      type: 'number | null',
      description: 'Real progress. Omit or null when unknown: the bar becomes indeterminate.',
    },
    { name: 'max', type: 'number', default: '1', description: 'Value that means complete.' },
    { name: 'showValue', type: 'boolean', default: 'false', description: 'Show the percentage.' },
    ...statusLoader,
  ],
  skeleton: [
    {
      name: 'loading',
      type: 'boolean',
      description: 'SkeletonGroup: show placeholders or content.',
    },
    {
      name: 'placeholder',
      type: 'ReactNode',
      description: 'SkeletonGroup: the shapes to show while loading.',
    },
    {
      name: 'label',
      type: 'string',
      default: "'Loading'",
      description: 'SkeletonGroup: accessible name of the busy region.',
    },
    {
      name: 'shape',
      type: "'line' | 'block' | 'circle'",
      default: "'line'",
      description: 'Skeleton: placeholder shape.',
    },
    { name: 'lines', type: 'number', default: '3', description: 'SkeletonText: number of lines.' },
    shared.reducedMotion,
  ],
  'thinking-indicator': [
    {
      name: 'state',
      type: "'thinking' | 'generating' | 'streaming' | 'tool' | 'paused' | 'completed' | 'failed' | 'cancelled'",
      description: 'The state your runtime reports.',
    },
    { name: 'label', type: 'string', description: 'Overrides the default wording.' },
    { name: 'tool', type: 'string', description: 'For state "tool": the tool being waited on.' },
    {
      name: 'startedAt',
      type: 'number',
      description: 'Epoch ms. Elapsed time is shown only when supplied.',
    },
    {
      name: 'variant',
      type: "'minimal' | 'detailed'",
      default: "'minimal'",
      description: 'detailed adds elapsed time.',
    },
    { name: 'size', type: 'number', default: '14', description: 'Indicator size in px.' },
    shared.accent,
    shared.reducedMotion,
    shared.className,
  ],
  'agent-activity': [
    {
      name: 'events',
      type: 'unknown[]',
      description:
        'Raw event log ({ id, title, status, kind?, seq?, target?, detail?, startedAt?, endedAt? }). Malformed entries are dropped.',
    },
    {
      name: 'title',
      type: 'string',
      default: "'Activity'",
      description: 'Heading and region name.',
    },
    {
      name: 'variant',
      type: "'detailed' | 'compact'",
      default: "'detailed'",
      description: 'compact hides details and timings.',
    },
    shared.accent,
    shared.reducedMotion,
    shared.className,
  ],
  'tool-call-card': [
    { name: 'name', type: 'string', description: 'Tool name as reported.' },
    {
      name: 'status',
      type: "'pending' | 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled'",
      description: 'Shown exactly as supplied.',
    },
    {
      name: 'args',
      type: 'unknown',
      description: 'Arguments, pretty-printed with secrets masked.',
    },
    { name: 'result', type: 'unknown', description: 'Output, treated as untrusted text.' },
    { name: 'error', type: 'string', description: 'Shown instead of the result.' },
    { name: 'startedAt', type: 'number', description: 'Epoch ms; live timer while running.' },
    { name: 'durationMs', type: 'number', description: 'Measured duration, shown once settled.' },
    {
      name: 'redactKeys',
      type: 'string[]',
      default: 'password, secret, token, apiKey…',
      description: 'Keys whose values are masked.',
    },
    { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Start expanded.' },
    shared.accent,
    shared.reducedMotion,
    shared.className,
  ],
  'approval-gate': [
    { name: 'title', type: 'string', description: 'What the agent wants to do.' },
    { name: 'description', type: 'string', description: 'Why, in a sentence.' },
    { name: 'action', type: 'string', description: 'The exact command or change, shown verbatim.' },
    { name: 'details', type: '{ label, value }[]', description: 'Facts that help decide.' },
    {
      name: 'risk',
      type: "'low' | 'medium' | 'high'",
      default: "'medium'",
      description: 'Written out, not only coloured.',
    },
    {
      name: 'status',
      type: "'pending' | 'submitting' | 'approved' | 'rejected' | 'expired' | 'failed'",
      description: 'Owned by your app; the gate never approves itself.',
    },
    {
      name: 'onApprove',
      type: '() => void | Promise<void>',
      description: 'Buttons stay disabled while a returned promise is pending.',
    },
    {
      name: 'onReject',
      type: '(reason?: string) => void | Promise<void>',
      description: 'Receives the optional reason.',
    },
    shared.accent,
    shared.reducedMotion,
    shared.className,
  ],
  'ai-sources': [
    {
      name: 'sources',
      type: 'unknown[]',
      description:
        'SourcesProvider: { id, title?, url?, domain?, description?, excerpt?, unavailable? }. Invalid entries are dropped.',
    },
    {
      name: 'id',
      type: 'string',
      description: 'Citation: the source id it refers to. Unknown ids render [?].',
    },
    { name: 'title', type: 'string', default: "'Sources'", description: 'SourceList: heading.' },
    shared.accent,
    shared.reducedMotion,
  ],
  'streaming-markdown': [
    { name: 'content', type: 'string', description: 'Everything received so far.' },
    {
      name: 'streaming',
      type: 'boolean',
      default: 'false',
      description: 'Shows a caret and marks the region busy.',
    },
    {
      name: 'stopped',
      type: 'boolean',
      default: 'false',
      description: 'Labels the text as incomplete.',
    },
    shared.accent,
    shared.reducedMotion,
    shared.className,
  ],
  'generative-card': [
    {
      name: 'spec',
      type: 'unknown',
      description: 'CardSpec object or JSON string. Validated before rendering.',
    },
    {
      name: 'onAction',
      type: '(id: string) => void',
      description: 'Called with an action id; running it is up to you.',
    },
    {
      name: 'streaming',
      type: 'boolean',
      default: 'false',
      description: 'Render valid parts of a partial result; hide actions.',
    },
    shared.accent,
    shared.reducedMotion,
    shared.className,
  ],
  'response-actions': [
    {
      name: 'actions',
      type: "('copy' | 'regenerate' | 'retry' | 'edit' | 'continue' | { id, label, icon?, disabled? })[]",
      description: 'In display order.',
    },
    { name: 'onAction', type: '(id: string) => void', description: 'Called for every action.' },
    { name: 'copyText', type: 'string', description: 'Clipboard text for the copy action.' },
    {
      name: 'labels',
      type: 'boolean',
      default: 'false',
      description: 'Show text labels next to icons.',
    },
    shared.accent,
    shared.className,
  ],
};

export const gameProps = gameLoader;

export const cssTokens = [
  ['--interlude-accent', 'Accent for indicators, focus rings and primary actions.'],
  ['--interlude-success', 'Completed, approved.'],
  ['--interlude-danger', 'Failed, high risk.'],
  ['--interlude-warning', 'Waiting, needs review.'],
  ['--interlude-panel', 'Card and game panel background (default transparent).'],
  ['--interlude-surface', 'Colour overlays blend towards (default Canvas).'],
] as const;
