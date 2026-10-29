import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotionConfig,
  useTransform,
} from 'motion/react';
import type { ReactNode } from 'react';
import { cx } from '../primitives/cx';
import { useLoop } from '../primitives/loop';
import { ease } from '../primitives/patterns';
import { fade, useReducedPreference, type ReducedMotion } from '../primitives/motion';
import { AutoHeight } from '../primitives/auto-size';
import { PresenceSlot } from '../primitives/presence-slot';

const shapes = {
  line: 'h-3 rounded-full',
  block: 'h-20 rounded-[10px]',
  circle: 'size-8 rounded-full',
} as const;

/** One placeholder shape. Decorative: the surrounding SkeletonGroup carries the status. */
export function Skeleton({
  shape = 'line',
  className,
}: {
  shape?: keyof typeof shapes;
  className?: string;
}) {
  const still = useReducedMotionConfig();
  return (
    <span
      aria-hidden
      className={cx('relative block overflow-hidden bg-current/[0.07]', shapes[shape], className)}
    >
      {!still && <Shimmer />}
    </span>
  );
}

/** One sweep per cycle, eased, from the shared clock. */
function Shimmer() {
  const phase = useLoop(1.4);
  const x = useTransform(phase, (p) => `${-100 + 200 * ease(p)}%`);
  return (
    <motion.span
      className="absolute inset-0 bg-linear-to-r from-transparent via-current/[0.06] to-transparent"
      style={{ x }}
    />
  );
}

/** Lines of text, with a shorter last line like a real paragraph. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <span aria-hidden className={cx('flex flex-col gap-2', className)}>
      {Array.from({ length: Math.max(1, lines) }, (_, i) => (
        <Skeleton key={i} className={i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full'} />
      ))}
    </span>
  );
}

/**
 * Swaps placeholders for content when `loading` turns false. Marks the region
 * busy and gives it one accessible name instead of exposing every shape.
 */
export function SkeletonGroup({
  loading,
  label = 'Loading',
  placeholder,
  children,
  reducedMotion,
  className,
}: {
  loading: boolean;
  label?: string;
  placeholder: ReactNode;
  children: ReactNode;
  reducedMotion?: ReducedMotion;
  className?: string;
}) {
  const reduced = useReducedPreference(reducedMotion);
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <div aria-busy={loading} className={className}>
        <AutoHeight>
          <AnimatePresence mode="popLayout" initial={false}>
            {loading ? (
              <PresenceSlot
                key="placeholder"
                block
                role="status"
                aria-label={label}
                exit={{ opacity: 0 }}
                transition={fade}
              >
                {placeholder}
              </PresenceSlot>
            ) : (
              <PresenceSlot
                key="content"
                block
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={fade}
              >
                {children}
              </PresenceSlot>
            )}
          </AnimatePresence>
        </AutoHeight>
      </div>
    </MotionConfig>
  );
}
