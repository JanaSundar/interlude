import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { cx } from '../primitives/cx';
import { DotMatrix } from '../primitives/dot-matrix';
import { LiveRegion } from '../primitives/live-region';
import { fade, useReducedPreference, type ReducedMotion } from '../primitives/motion';
import type { ActivityStatus } from '../primitives/status';
import { StatusIcon } from '../primitives/status-icon';
import { themeVars } from '../primitives/tokens';
import { useElapsed } from '../primitives/use-elapsed';
import { thinkingPatterns } from './patterns';
import { AutoWidth } from '../primitives/auto-size';

export type ThinkingState =
  | 'thinking'
  | 'generating'
  | 'streaming'
  | 'tool'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type ThinkingIndicatorProps = {
  /** The state your runtime reports. This component only displays it. */
  state: ThinkingState;
  /** Overrides the default wording, e.g. "Searching the docs". */
  label?: string;
  /** For state "tool": which tool is being waited on. */
  tool?: string;
  /** Epoch ms when the current run started; shows elapsed time when supplied. */
  startedAt?: number;
  /** minimal: indicator and words. detailed: adds elapsed time. */
  variant?: 'minimal' | 'detailed';
  size?: number;
  accent?: string;
  reducedMotion?: ReducedMotion;
  className?: string;
};

const settled: Partial<Record<ThinkingState, ActivityStatus>> = {
  paused: 'waiting',
  completed: 'completed',
  failed: 'failed',
  cancelled: 'cancelled',
};

export function defaultLabel(state: ThinkingState, tool?: string): string {
  switch (state) {
    case 'thinking':
      return 'Thinking';
    case 'generating':
      return 'Generating';
    case 'streaming':
      return 'Writing';
    case 'tool':
      return tool ? `Waiting for ${tool}` : 'Waiting for a tool';
    case 'paused':
      return 'Paused';
    case 'completed':
      return 'Done';
    case 'failed':
      return 'Stopped with an error';
    case 'cancelled':
      return 'Stopped';
  }
}

/**
 * Communicates what the model is observably doing. It does not expose or
 * imitate private reasoning; the words are statuses, not thoughts.
 */
export function ThinkingIndicator({
  state,
  label,
  tool,
  startedAt,
  variant = 'minimal',
  size = 14,
  accent,
  reducedMotion,
  className,
}: ThinkingIndicatorProps) {
  const reduced = useReducedPreference(reducedMotion);
  const icon = settled[state];
  const text = label ?? defaultLabel(state, tool);
  const elapsed = useElapsed(variant === 'detailed' ? startedAt : undefined, !icon);

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <span
        data-state={state}
        style={themeVars(accent)}
        className={cx('inline-flex items-center gap-2.5 text-sm', className)}
      >
        <LiveRegion message={text} />
        <span
          aria-hidden
          className="grid shrink-0 place-items-center"
          style={{ width: size, height: size }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={icon ? 'icon' : state}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={fade}
              className="grid place-items-center"
            >
              {icon ? (
                <StatusIcon status={icon} />
              ) : (
                <DotMatrix
                  pattern={thinkingPatterns[state as keyof typeof thinkingPatterns]}
                  size={size}
                  reduced={reduced}
                />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
        <AutoWidth>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={text}
              aria-hidden
              className="whitespace-nowrap"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: icon ? 0.6 : 0.85, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={fade}
            >
              {text}
            </motion.span>
          </AnimatePresence>
        </AutoWidth>
        <AnimatePresence initial={false}>
          {elapsed !== null && (
            <motion.span
              key="elapsed"
              aria-hidden
              className="font-mono text-[11px] tabular-nums"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={fade}
            >
              {elapsed}s
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </MotionConfig>
  );
}
