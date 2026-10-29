import { isSettled, toActivityStatus, type ActivityStatus } from '../primitives/status';

const kinds = ['search', 'read', 'tool', 'approval', 'process', 'message', 'complete'] as const;

export type ActivityKind = (typeof kinds)[number];

/** One observable step, as reported by your runtime. Send updates with the same id. */
export type ActivityEvent = {
  id: string;
  kind?: ActivityKind;
  title: string;
  status: ActivityStatus;
  /** Monotonic stream position. Lets late or repeated deliveries be ignored safely. */
  seq?: number;
  /** A query, path or tool name, shown in mono. */
  target?: string;
  /** Plain text shown when the step is expanded. Rendered as text, never HTML. */
  detail?: string;
  /** Epoch ms or ISO string, when known. */
  startedAt?: number | string;
  endedAt?: number | string;
};

export type ActivityItem = ActivityEvent & { order: number };

const kindSet: ReadonlySet<string> = new Set(kinds);
const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined);
const time = (v: unknown) => (typeof v === 'number' || typeof v === 'string' ? v : undefined);

/** Narrow untrusted input. Returns null when there's nothing honest to show. */
export function normalizeEvent(raw: unknown): ActivityEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as Record<string, unknown>;
  const id = typeof e.id === 'number' ? String(e.id) : text(e.id);
  const title = text(e.title);
  if (!id || !title) return null;
  return {
    id,
    title,
    status: toActivityStatus(e.status),
    kind: typeof e.kind === 'string' && kindSet.has(e.kind) ? (e.kind as ActivityKind) : undefined,
    seq: typeof e.seq === 'number' && Number.isFinite(e.seq) ? e.seq : undefined,
    target: text(e.target),
    detail: text(e.detail),
    startedAt: time(e.startedAt),
    endedAt: time(e.endedAt),
  };
}

/**
 * Folds a raw event log into display rows. Pure and idempotent:
 * - rows appear in order of first sighting (by seq when present);
 * - an update older than what's already applied is ignored;
 * - a settled step never returns to running from an unsequenced update.
 */
export function foldActivity(log: readonly unknown[]): ActivityItem[] {
  const rows = new Map<string, ActivityItem>();
  log.forEach((raw, index) => {
    const event = normalizeEvent(raw);
    if (!event) return;
    const prev = rows.get(event.id);
    if (!prev) {
      rows.set(event.id, { ...event, order: event.seq ?? index });
      return;
    }
    // A late delivery still fixes the row's position, even when its data is stale.
    const order = Math.min(prev.order, event.seq ?? prev.order);
    const stale =
      (event.seq !== undefined && prev.seq !== undefined && event.seq <= prev.seq) ||
      (event.seq === undefined && isSettled(prev.status) && !isSettled(event.status));
    rows.set(event.id, stale ? { ...prev, order } : { ...prev, ...definedOnly(event), order });
  });
  return [...rows.values()].sort((a, b) => a.order - b.order);
}

function definedOnly(event: ActivityEvent): Partial<ActivityEvent> {
  return Object.fromEntries(Object.entries(event).filter(([, v]) => v !== undefined));
}

export type ActivitySummary = {
  total: number;
  done: number;
  failed: number;
  current?: ActivityItem;
};

export function summarize(items: readonly ActivityItem[]): ActivitySummary {
  const summary: ActivitySummary = { total: items.length, done: 0, failed: 0 };
  for (const item of items) {
    if (item.status === 'completed') summary.done++;
    else if (item.status === 'failed') summary.failed++;
    else if (item.status === 'running' || item.status === 'waiting') summary.current = item;
  }
  return summary;
}

/** Duration in ms when both ends are known; never estimated. */
export function durationOf(item: ActivityEvent): number | null {
  if (item.startedAt === undefined || item.endedAt === undefined) return null;
  const ms = new Date(item.endedAt).getTime() - new Date(item.startedAt).getTime();
  return Number.isFinite(ms) && ms >= 0 ? ms : null;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const s = ms / 1000;
  return s < 60 ? `${s.toFixed(s < 10 ? 1 : 0)}s` : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

/** What changed between two folds, phrased for a screen reader. Only step starts and endings. */
export function describeChange(
  before: readonly ActivityItem[],
  after: readonly ActivityItem[],
): string {
  const old = new Map(before.map((i) => [i.id, i.status]));
  const changed = after.filter(
    (i) => old.get(i.id) !== i.status && (isSettled(i.status) || !old.has(i.id)),
  );
  const last = changed.at(-1);
  if (!last) return '';
  return `${last.title}: ${last.status}`;
}
