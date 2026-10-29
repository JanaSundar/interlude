/**
 * One vocabulary for every component. Task statuses describe a host-owned
 * operation (loaders); activity statuses describe observable AI steps. Both
 * map onto the same small set of visual kinds.
 */
export type TaskStatus = 'idle' | 'loading' | 'success' | 'error' | 'cancelled';
export type ActivityStatus =
  | 'pending'
  | 'running'
  | 'waiting'
  | 'completed'
  | 'failed'
  | 'cancelled';
export type Status = TaskStatus | ActivityStatus;

export type StatusKind = 'idle' | 'active' | 'waiting' | 'success' | 'error' | 'cancelled';

const kinds: Record<Status, StatusKind> = {
  idle: 'idle',
  pending: 'idle',
  loading: 'active',
  running: 'active',
  waiting: 'waiting',
  success: 'success',
  completed: 'success',
  error: 'error',
  failed: 'error',
  cancelled: 'cancelled',
};

const labels: Record<Status, string> = {
  idle: 'Idle',
  pending: 'Pending',
  loading: 'Working',
  running: 'Running',
  waiting: 'Waiting',
  success: 'Done',
  completed: 'Completed',
  error: 'Something went wrong',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export const statusKind = (status: Status): StatusKind => kinds[status];
export const statusLabel = (status: Status): string => labels[status];

/** Finished one way or another: no further progress will be shown. */
export function isSettled(status: Status): boolean {
  const kind = kinds[status];
  return kind === 'success' || kind === 'error' || kind === 'cancelled';
}

const activityStatuses: readonly string[] = [
  'pending',
  'running',
  'waiting',
  'completed',
  'failed',
  'cancelled',
] satisfies ActivityStatus[];

/** Narrow untrusted input to an activity status; anything unknown is pending. */
export function toActivityStatus(value: unknown): ActivityStatus {
  return typeof value === 'string' && activityStatuses.includes(value)
    ? (value as ActivityStatus)
    : 'pending';
}

/** Accepts either a full status or the ordinary boolean most apps already have. */
export function resolveTask(
  status: TaskStatus | undefined,
  active: boolean | undefined,
): TaskStatus {
  if (status) return status;
  return active ? 'loading' : 'idle';
}
