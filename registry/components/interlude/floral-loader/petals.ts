import { clamp01 } from '../primitives/math';
import { ease } from '../primitives/patterns';

export const PETALS = 6;
export const FLORAL_PERIOD = 3;

/** One petal pointing up from the centre, in a 24-unit box around the origin. */
export const PETAL_PATH = 'M0 0C3.4 -3 3.2 -8 0 -10.6C-3.2 -8 -3.4 -3 0 0Z';

/** Fractions of the cycle: one petal's unfolding, the gap between petals, and when they fold. */
const OPEN = 0.2;
const STAGGER = 0.05;
const CLOSE_AT = 0.5;

/** How small and faint a folded petal is, so the flower rests as a bud, never as nothing. */
const BUD = 0.3;

/** Pure: degrees a petal is turned from straight up. */
export const petalAngle = (index: number): number => (index * 360) / PETALS;

/**
 * Pure: how open a petal is at `phase`, 0 folded to 1 open. Petals open one
 * after another around the flower, rest, then fold in the same order.
 */
export function petalOpen(phase: number, index: number): number {
  const at = (start: number) => ease(clamp01((phase - start - index * STAGGER) / OPEN));
  return at(0) - at(CLOSE_AT);
}

/** Pure: a petal's size and strength for how open it is. */
export const petalFrame = (open: number): { scale: number; opacity: number } => ({
  scale: BUD + (1 - BUD) * open,
  opacity: BUD + (1 - BUD) * open,
});
