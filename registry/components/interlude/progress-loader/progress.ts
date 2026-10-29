import { clamp01 } from '../primitives/math';
import { ease } from '../primitives/patterns';

/**
 * Normalises host-supplied progress. Anything that isn't a finite number is
 * treated as unknown (indeterminate) rather than guessed.
 */
export function toFraction(value: unknown, max = 1): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || !(max > 0)) return null;
  return clamp01(value / max);
}

export const percent = (fraction: number) => `${Math.round(fraction * 100)}%`;

/** Seconds per indeterminate sweep at speed 1. */
export const SWEEP_PERIOD = 1.3;

/**
 * Pure: where the indeterminate sweep is after `seconds`, as a translateX
 * percentage of its own width. It enters fully off the left edge (-100%)
 * and leaves fully off the right (250% of a 40%-wide sweep), eased in and out.
 */
export function sweepOffset(seconds: number, period = SWEEP_PERIOD): number {
  const phase = (((seconds / period) % 1) + 1) % 1;
  return -100 + ease(phase) * 350;
}
