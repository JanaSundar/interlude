import { useEffect, useRef, useState } from 'react';
import { AgentActivity } from '@registry/components/interlude/agent-activity/agent-activity';
import { ApprovalGate } from '@registry/components/interlude/approval-gate/approval-gate';
import type { ApprovalStatus, Risk } from '@registry/components/interlude/approval-gate/decision';
import type { ActivityStatus } from '@registry/components/interlude/primitives/status';
import {
  ThinkingIndicator,
  type ThinkingState,
} from '@registry/components/interlude/thinking-indicator/thinking-indicator';
import { ToolCallCard } from '@registry/components/interlude/tool-call-card/tool-call-card';
import { runTimeline } from '../fixtures';
import { useReplay } from '../replay';
import { changed, expr, importLine, jsx } from './jsx';
import type { PlaygroundSpec, Values } from './playground';
import { useOnBump } from './use-on-bump';
import {
  isStill,
  accentControl,
  appearance,
  appearanceCode,
  appearanceDefaults,
  labelControl,
  motionControl,
  sizeControl,
  snippet,
} from './shared';

const thinkingStates = [
  'thinking',
  'generating',
  'streaming',
  'tool',
  'paused',
  'completed',
  'failed',
  'cancelled',
];

function ThinkingPreview({ values: v }: { values: Values }) {
  const [startedAt] = useState(() => Date.now());
  return (
    <ThinkingIndicator
      state={v.state as ThinkingState}
      label={String(v.label) || undefined}
      tool={String(v.tool) || undefined}
      startedAt={v.elapsed && !isStill(v) ? startedAt : undefined}
      variant={v.variant as 'minimal' | 'detailed'}
      size={Number(v.size)}
      {...appearance(v)}
    />
  );
}

export const thinkingSpec: PlaygroundSpec = {
  controls: [
    { type: 'choice', key: 'state', label: 'state', options: thinkingStates },
    labelControl('default wording'),
    { type: 'text', key: 'tool', label: 'tool' },
    { type: 'choice', key: 'variant', label: 'variant', options: ['minimal', 'detailed'] },
    { type: 'toggle', key: 'elapsed', label: 'pass startedAt' },
    sizeControl(10, 32),
    accentControl,
    motionControl,
  ],
  defaults: {
    state: 'thinking',
    label: '',
    tool: 'web_search',
    variant: 'detailed',
    elapsed: true,
    size: 16,
    ...appearanceDefaults,
  },
  examples: [
    { title: 'Waiting for a tool', values: { state: 'tool' } },
    { title: 'Minimal', values: { state: 'generating', variant: 'minimal', elapsed: false } },
    { title: 'Completed', values: { state: 'completed' } },
  ],
  Preview: ThinkingPreview,
  code: (v) =>
    snippet(
      importLine(['ThinkingIndicator'], 'thinking-indicator'),
      jsx(
        'ThinkingIndicator',
        changed(
          {
            state: v.state,
            label: String(v.label) || undefined,
            tool: v.state === 'tool' ? String(v.tool) || undefined : undefined,
            startedAt: v.elapsed ? expr('run.startedAt') : undefined,
            variant: v.variant,
            size: v.size,
            ...appearanceCode(v),
          },
          { variant: 'minimal', size: 14 },
        ),
      ),
    ),
  note: 'Elapsed time appears only when a real start time is passed.',
};

const activityTimeline = runTimeline.filter((e) => e.value.type === 'activity');

function ActivityPreview({ values: v }: { values: Values }) {
  const still = isStill(v);
  const { released, replay } = useReplay(activityTimeline, { autoplay: !still });
  useOnBump(v.replay, replay);
  const log = (still ? activityTimeline.map((e) => e.value) : released).map((e) =>
    e.type === 'activity' ? e.event : null,
  );
  const events = v.delivery === 'duplicated + reversed' ? [...log].reverse().concat(log) : log;
  return (
    <AgentActivity
      events={events}
      title={String(v.title)}
      variant={v.variant as 'detailed' | 'compact'}
      className="w-full max-w-md"
      {...appearance(v)}
    />
  );
}

export const activitySpec: PlaygroundSpec = {
  controls: [
    { type: 'text', key: 'title', label: 'title' },
    { type: 'choice', key: 'variant', label: 'variant', options: ['detailed', 'compact'] },
    {
      type: 'choice',
      key: 'delivery',
      label: 'event delivery',
      options: ['clean', 'duplicated + reversed'],
    },
    { type: 'action', key: 'replay', label: 'Replay events' },
    accentControl,
    motionControl,
  ],
  defaults: {
    title: 'Investigating the failing test',
    variant: 'detailed',
    delivery: 'clean',
    replay: 0,
    ...appearanceDefaults,
  },
  examples: [
    { title: 'Detailed', values: {} },
    { title: 'Compact', values: { variant: 'compact' } },
    {
      title: 'Unreliable delivery',
      description: 'Duplicated and reversed events still fold into the right rows, in order.',
      values: { delivery: 'duplicated + reversed' },
    },
  ],
  Preview: ActivityPreview,
  code: (v) =>
    snippet(
      importLine(['AgentActivity'], 'agent-activity'),
      jsx(
        'AgentActivity',
        changed(
          { events: expr('events'), title: v.title, variant: v.variant, ...appearanceCode(v) },
          { variant: 'detailed', title: 'Activity' },
        ),
      ),
      '// Append raw events as they arrive; updates share an id.',
    ),
  note: 'Scripted replay · switch delivery to see duplicates and late events folded safely.',
};

function ToolPreview({ values: v }: { values: Values }) {
  const status = v.status as ActivityStatus;
  const [startedAt, setStartedAt] = useState(() => Date.now());
  useEffect(() => {
    if (status === 'running') setStartedAt(Date.now());
  }, [status]);
  return (
    <ToolCallCard
      key={String(v.defaultOpen)}
      className="w-full max-w-md"
      name={String(v.name)}
      status={status}
      startedAt={isStill(v) ? undefined : startedAt}
      durationMs={Number(v.durationMs)}
      defaultOpen={!!v.defaultOpen}
      args={v.args ? { query: 'reduced motion', limit: 5, apiKey: 'sk-demo-not-real' } : undefined}
      result={
        status === 'completed' && v.result ? { hits: 2, top: 'Accessibility · Motion' } : undefined
      }
      error={status === 'failed' ? String(v.error) : undefined}
      {...appearance(v)}
    />
  );
}

export const toolCallSpec: PlaygroundSpec = {
  controls: [
    { type: 'text', key: 'name', label: 'name' },
    {
      type: 'choice',
      key: 'status',
      label: 'status',
      options: ['pending', 'running', 'waiting', 'completed', 'failed', 'cancelled'],
    },
    { type: 'toggle', key: 'args', label: 'args' },
    { type: 'toggle', key: 'result', label: 'result (when completed)' },
    { type: 'text', key: 'error', label: 'error (when failed)' },
    {
      type: 'range',
      key: 'durationMs',
      label: 'durationMs',
      min: 100,
      max: 20000,
      step: 100,
      format: (ms) => `${(ms / 1000).toFixed(1)}s`,
    },
    { type: 'toggle', key: 'defaultOpen', label: 'defaultOpen' },
    accentControl,
    motionControl,
  ],
  defaults: {
    name: 'search_docs',
    status: 'running',
    args: true,
    result: true,
    error: 'Upstream returned 503 after 3 retries.',
    durationMs: 1800,
    defaultOpen: true,
    ...appearanceDefaults,
  },
  examples: [
    { title: 'Running', values: {} },
    { title: 'Completed', values: { status: 'completed' } },
    { title: 'Failed', values: { status: 'failed' } },
  ],
  Preview: ToolPreview,
  code: (v) =>
    snippet(
      importLine(['ToolCallCard'], 'tool-call-card'),
      jsx('ToolCallCard', {
        name: v.name,
        status: v.status,
        args: v.args ? expr('call.args') : undefined,
        result: v.result ? expr('call.result') : undefined,
        error: v.status === 'failed' ? expr('call.error') : undefined,
        startedAt: expr('call.startedAt'),
        durationMs: expr('call.durationMs'),
        defaultOpen: v.defaultOpen || undefined,
        ...appearanceCode(v),
      }),
    ),
  note: 'Secret-looking keys (apiKey, token, password…) are masked in arguments and results.',
};

/** Plays the host: decisions are recorded after a delay, or fail on purpose. */
function ApprovalPreview({ values: v }: { values: Values }) {
  const [status, setStatus] = useState<ApprovalStatus>('pending');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const decide = (outcome: ApprovalStatus) =>
    new Promise<void>((resolve) => {
      timer.current = setTimeout(() => {
        setStatus(v.host === 'fails' ? 'failed' : outcome);
        resolve();
      }, Number(v.latency));
    });
  return (
    <ApprovalGate
      className="w-full max-w-md"
      title={String(v.title)}
      description={String(v.description) || undefined}
      action={String(v.action) || undefined}
      details={[
        { label: 'Files', value: '3 (412 KB)' },
        { label: 'Reversible', value: 'No' },
      ]}
      risk={v.risk as Risk}
      status={status}
      approveLabel={String(v.approveLabel)}
      onApprove={() => decide('approved')}
      onReject={() => decide('rejected')}
      {...appearance(v)}
    />
  );
}

export const approvalSpec: PlaygroundSpec = {
  controls: [
    { type: 'text', key: 'title', label: 'title' },
    { type: 'text', key: 'description', label: 'description' },
    { type: 'text', key: 'action', label: 'action' },
    { type: 'choice', key: 'risk', label: 'risk', options: ['low', 'medium', 'high'] },
    { type: 'text', key: 'approveLabel', label: 'approveLabel' },
    { type: 'choice', key: 'host', label: 'simulated host', options: ['confirms', 'fails'] },
    {
      type: 'range',
      key: 'latency',
      label: 'host latency',
      min: 200,
      max: 3000,
      step: 100,
      format: (ms) => `${ms}ms`,
    },
    accentControl,
    motionControl,
  ],
  defaults: {
    title: 'Delete 3 build logs',
    description: 'The agent wants to clean up before re-running the suite.',
    action: 'rm build/logs/*.log',
    risk: 'high',
    approveLabel: 'Approve',
    host: 'confirms',
    latency: 900,
    ...appearanceDefaults,
  },
  examples: [
    { title: 'High risk', values: {} },
    {
      title: 'Low risk',
      values: {
        title: 'Rename branch',
        description: '',
        action: 'git branch -m fix/tz',
        risk: 'low',
      },
    },
    {
      title: 'Host fails',
      description: 'If your runtime can’t record the decision, the gate says so.',
      values: { host: 'fails' },
    },
  ],
  Preview: ApprovalPreview,
  code: (v) =>
    snippet(
      importLine(['ApprovalGate'], 'approval-gate'),
      jsx(
        'ApprovalGate',
        changed(
          {
            title: v.title,
            description: String(v.description) || undefined,
            action: String(v.action) || undefined,
            risk: v.risk,
            status: expr('approval.status'),
            approveLabel: v.approveLabel,
            onApprove: expr('() => runtime.approve(id)'),
            onReject: expr('(reason) => runtime.reject(id, reason)'),
            ...appearanceCode(v),
          },
          { risk: 'medium', approveLabel: 'Approve' },
        ),
      ),
    ),
  note: 'Simulated host · the gate shows an outcome only after the host sets status. Reset to ask again.',
};
