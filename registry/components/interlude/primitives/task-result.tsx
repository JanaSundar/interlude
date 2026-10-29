import { StatusIcon } from './status-icon';
import { statusLabel, type TaskStatus } from './status';

/** Default end state for loaders: a status shape plus words. */
export function TaskResult({ status, message }: { status: TaskStatus; message?: string }) {
  return (
    <span className="inline-flex items-center gap-2 py-1 text-sm">
      <StatusIcon status={status} />
      <span className="opacity-75">{message ?? statusLabel(status)}</span>
    </span>
  );
}
