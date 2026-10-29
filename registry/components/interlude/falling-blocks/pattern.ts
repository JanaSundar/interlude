import type { DotPattern } from '../primitives/dot-matrix';
import { clamp01 } from '../primitives/math';
import { ease, lit } from '../primitives/patterns';

/** Order in which the four columns receive a falling dot. */
const DROPS = [1, 3, 0, 2];
const DROP_SLOT = DROPS.map((_, col) => DROPS.indexOf(col));

/**
 * Dots drop one column at a time and settle into a stack that fills, holds,
 * and clears — a gravity loader with a puzzle hidden in it.
 */
export const fallingBlocksPattern: DotPattern = {
  cols: 4,
  rows: 4,
  period: 2.4,
  frame: (phase, col, row) => {
    const slot = DROP_SLOT[col] as number;
    // Each column's dot falls during its quarter of the first 80% of the cycle.
    const start = slot * 0.2;
    const t = clamp01((phase - start) / 0.2);
    const clearing = phase > 0.88;
    if (row === 3) {
      if (clearing) return { o: lit(1 - (phase - 0.88) / 0.12), s: 1.1 };
      if (t <= 0) return { o: lit(0) };
      // The falling dot travels down from row 0 to the floor.
      const y = -3 * (1 - ease(t));
      return { o: lit(1), y };
    }
    return { o: lit(0), s: 0.85 };
  },
};
