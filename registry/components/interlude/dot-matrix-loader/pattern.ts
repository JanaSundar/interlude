import type { DotPattern } from '../primitives/dot-matrix';
import { lit, pulse } from '../primitives/patterns';

/** A diagonal ripple across a 3×3 grid: calm, symmetric, readable at 12px. */
export const ripplePattern: DotPattern = {
  cols: 3,
  rows: 3,
  period: 1.4,
  frame: (phase, col, row) => {
    const v = pulse(phase, ((col + row) / 4) * 0.7, 0.24);
    return { o: lit(v), s: 0.8 + 0.25 * v };
  },
};
