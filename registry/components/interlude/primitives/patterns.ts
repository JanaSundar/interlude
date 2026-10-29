/** Small pure helpers shared by the loader dot patterns. */
import { clamp01 } from './math';

/** Opacity of a dot at rest; low enough to read as texture, not content. */
export const REST = 0.16;

/** Circular distance between two phases in [0, 1). */
export function phaseDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 1;
  return Math.min(d, 1 - d);
}

/** 1 at `at`, falling linearly to 0 at ±width (wrapping around the cycle). */
export function pulse(phase: number, at: number, width = 0.15): number {
  return Math.max(0, 1 - phaseDistance(phase, at) / width);
}

/** Map an intensity in [0, 1] onto the resting → lit opacity range. */
export function lit(v: number): number {
  return REST + (1 - REST) * clamp01(v);
}

export const ease = (t: number) => t * t * (3 - 2 * t);
