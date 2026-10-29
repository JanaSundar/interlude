import { AnimatePresence, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { cx } from './cx';
import { LiveRegion } from './live-region';
import { PresenceSlot } from './presence-slot';
import { fade, useReducedPreference, type ReducedMotion } from './motion';
import { resolveTask, statusLabel, type TaskStatus } from './status';
import { TaskResult } from './task-result';
import { themeVars } from './tokens';
import { AutoWidth } from './auto-size';

/** Props every status-aware loader accepts. */
export type StatusLoaderProps = {
  /** Full task status, owned by your app. Takes precedence over `active`. */
  status?: TaskStatus;
  /** Shorthand for apps that only have a boolean: true → loading, false → idle. */
  active?: boolean;
  /** What the task is doing, e.g. "Uploading files". Visible and announced. */
  label?: string;
  /** Indicator size in px. */
  size?: number;
  /** Any CSS colour; defaults to var(--interlude-accent). */
  accent?: string;
  /** Animation speed multiplier, 0.5–2. */
  speed?: number;
  reducedMotion?: ReducedMotion;
  /** Rendered once the task ends; receives the terminal status. */
  result?: ReactNode | ((status: TaskStatus) => ReactNode);
  className?: string;
};

/**
 * Shell shared by the conventional loaders: idle renders nothing, loading
 * renders the indicator, and any terminal status replaces it at once. The
 * loader never decides completion itself.
 */
export function LoaderFrame({
  status,
  active,
  label,
  accent,
  reducedMotion,
  result,
  className,
  children,
}: StatusLoaderProps & { children: (reduced: boolean) => ReactNode }) {
  const task = resolveTask(status, active);
  const reduced = useReducedPreference(reducedMotion);
  if (task === 'idle') return null;
  const message = task === 'loading' ? (label ?? statusLabel(task)) : statusLabel(task);
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <span
        data-interlude=""
        data-task={task}
        style={themeVars(accent)}
        className={cx('relative inline-flex items-center', className)}
      >
        <LiveRegion message={message} />
        <AutoWidth>
          <AnimatePresence mode="popLayout" initial={false}>
            <PresenceSlot
              key={task === 'loading' ? 'loading' : 'result'}
              className="inline-flex items-center gap-2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
            >
              {task === 'loading' ? (
                <>
                  {children(reduced)}
                  {label && (
                    <span aria-hidden className="text-sm opacity-70">
                      {label}
                    </span>
                  )}
                </>
              ) : typeof result === 'function' ? (
                result(task)
              ) : (
                (result ?? <TaskResult status={task} />)
              )}
            </PresenceSlot>
          </AnimatePresence>
        </AutoWidth>
      </span>
    </MotionConfig>
  );
}
