import { AnimatePresence, LayoutGroup, motion, MotionConfig } from 'motion/react';
import { Collapsible, useDisclosure } from '../primitives/collapsible';
import { cx } from '../primitives/cx';
import { Icon } from '../primitives/icons';
import { LiveRegion } from '../primitives/live-region';
import { fade, softSpring, useReducedPreference, type ReducedMotion } from '../primitives/motion';
import { Pressable } from '../primitives/pressable';
import { DEFAULT_REDACT, formatJson } from '../primitives/safe';
import { isSettled, statusKind, statusLabel, type ActivityStatus } from '../primitives/status';
import { StatusIcon } from '../primitives/status-icon';
import { kindText, surface, themeVars } from '../primitives/tokens';
import { useElapsed } from '../primitives/use-elapsed';

export type ToolCallCardProps = {
  /** Tool name as your runtime reports it. */
  name: string;
  /** Status from your runtime. "completed" is shown only when you say so. */
  status: ActivityStatus;
  /** Arguments sent to the tool; any JSON-like value. */
  args?: unknown;
  /** The tool's output. Treated as untrusted and shown as text. */
  result?: unknown;
  /** Error message when the call failed. */
  error?: string;
  /** Epoch ms; enables a live timer while running. */
  startedAt?: number;
  /** Measured duration in ms, shown once settled. */
  durationMs?: number;
  /** Keys whose values are masked in arguments and results. */
  redactKeys?: readonly string[];
  defaultOpen?: boolean;
  accent?: string;
  reducedMotion?: ReducedMotion;
  className?: string;
};

export function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`;
}

export function ToolCallCard({
  name,
  status,
  args,
  result,
  error,
  startedAt,
  durationMs,
  redactKeys = DEFAULT_REDACT,
  defaultOpen = false,
  accent,
  reducedMotion,
  className,
}: ToolCallCardProps) {
  const reduced = useReducedPreference(reducedMotion);
  const { open, panelId, triggerProps } = useDisclosure(defaultOpen);
  const settled = isSettled(status);
  const elapsed = useElapsed(startedAt, !settled);
  const timing =
    settled && durationMs !== undefined
      ? formatSeconds(durationMs)
      : !settled && elapsed !== null
        ? `${elapsed}s`
        : null;
  const hasBody = args !== undefined || result !== undefined || !!error;
  const outcome = error ? 'error' : result !== undefined ? 'result' : null;

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <motion.div
        layout
        transition={softSpring}
        data-status={status}
        style={themeVars(accent)}
        className={cx(surface, 'overflow-hidden', className)}
      >
        <LiveRegion message={`${name}: ${statusLabel(status)}`} />
        <Pressable
          {...triggerProps}
          disabled={!hasBody}
          pressScale={1}
          tint={{ hover: 3, press: 6 }}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
        >
          <LayoutGroup>
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-current/[0.06]">
              <Icon name="tool" className="size-3.5 opacity-70" />
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{name}</span>
            <motion.span
              layout="position"
              transition={softSpring}
              className={cx('flex items-center gap-1.5 text-xs', kindText[statusKind(status)])}
            >
              <StatusIcon status={status} />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={status}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={fade}
                >
                  {statusLabel(status)}
                </motion.span>
              </AnimatePresence>
            </motion.span>
            <AnimatePresence mode="popLayout" initial={false}>
              {timing && (
                <motion.span
                  key="timing"
                  layout="position"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.45 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                  className="font-mono text-[11px] tabular-nums"
                >
                  {timing}
                </motion.span>
              )}
            </AnimatePresence>
            {hasBody && (
              <motion.span
                layout="position"
                animate={{ rotate: open ? 90 : 0 }}
                transition={softSpring}
                className="opacity-45"
              >
                <Icon name="chevron" className="size-3" />
              </motion.span>
            )}
          </LayoutGroup>
        </Pressable>
        <Collapsible open={open && hasBody} id={panelId}>
          <div className="flex flex-col gap-3 border-t border-current/[0.07] px-3 py-3">
            {args !== undefined && (
              <Payload label="Arguments" value={formatJson(args, redactKeys)} />
            )}
            <AnimatePresence mode="popLayout" initial={false}>
              {outcome && (
                <motion.div
                  key={outcome}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={softSpring}
                >
                  {outcome === 'error' ? (
                    <Payload label="Error" value={error!} tone="error" />
                  ) : (
                    <Payload label="Result" value={formatJson(result, redactKeys)} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Collapsible>
      </motion.div>
    </MotionConfig>
  );
}

function Payload({ label, value, tone }: { label: string; value: string; tone?: 'error' }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10px] tracking-wider uppercase opacity-45">{label}</p>
      <pre
        className={cx(
          'max-h-56 overflow-auto rounded-[8px] bg-current/[0.04] p-2.5 font-mono text-[11.5px] leading-relaxed break-words whitespace-pre-wrap',
          tone === 'error' && 'text-(color:--il-danger)',
        )}
      >
        {value}
      </pre>
    </div>
  );
}
