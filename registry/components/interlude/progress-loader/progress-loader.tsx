import { motion, useTime, useTransform } from 'motion/react';
import { cx } from '../primitives/cx';
import { LoaderFrame, type StatusLoaderProps } from '../primitives/loader-frame';
import { clampSpeed, softSpring } from '../primitives/motion';
import { percent, sweepOffset, toFraction } from './progress';

export type ProgressLoaderProps = StatusLoaderProps & {
  /** Real progress from your app. Omit it (or pass null) when progress is unknown. */
  value?: number | null;
  /** Value that means complete. */
  max?: number;
  /** Show the percentage next to the bar. */
  showValue?: boolean;
};

/**
 * Determinate when you supply a value, an honest indeterminate sweep when
 * you don't. It never invents or eases towards a number on its own.
 */
export function ProgressLoader({
  value,
  max = 1,
  showValue = false,
  size = 160,
  speed,
  label,
  ...frame
}: ProgressLoaderProps) {
  const fraction = toFraction(value, max);
  return (
    <LoaderFrame {...frame} label={label}>
      {(reduced) => (
        <span className="inline-flex items-center gap-2.5">
          <span
            role="progressbar"
            aria-label={label ?? 'Progress'}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={fraction === null ? undefined : Math.round(fraction * 100)}
            className="relative block h-1.5 shrink-0 overflow-hidden rounded-full bg-current/10"
            style={{ width: size }}
          >
            {fraction !== null ? (
              <motion.span
                className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-(--il-accent)"
                initial={false}
                animate={{ scaleX: fraction }}
                transition={softSpring}
              />
            ) : (
              <Sweep speed={clampSpeed(speed)} reduced={reduced} />
            )}
          </span>
          {showValue && fraction !== null && (
            <span aria-hidden className="font-mono text-xs tabular-nums opacity-60">
              {percent(fraction)}
            </span>
          )}
        </span>
      )}
    </LoaderFrame>
  );
}

/**
 * The indeterminate state, driven by one continuous clock rather than a
 * repeating keyframe animation, so it can never park at an end frame.
 * No React renders while it runs.
 */
function Sweep({ speed, reduced }: { speed: number; reduced: boolean }) {
  const time = useTime();
  const x = useTransform(time, (ms) => `${sweepOffset((ms / 1000) * speed)}%`);
  return (
    <motion.span
      className={cx(
        'absolute inset-y-0 rounded-full bg-(--il-accent)',
        reduced ? 'left-0 w-full opacity-40' : 'w-2/5',
      )}
      style={reduced ? undefined : { x }}
    />
  );
}
