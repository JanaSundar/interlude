import type { DotPattern } from '../primitives/dot-matrix';
import { lit, pulse } from '../primitives/patterns';

/**
 * A dot runs along the bottom row while an obstacle dot slides in from the
 * right; just before they meet, the runner hops up a row and lands again.
 */
export const dinoPattern: DotPattern = {
  cols: 6,
  rows: 3,
  period: 1.8,
  frame: (phase, col, row) => {
    // The obstacle crosses the board once per cycle, right to left.
    const pos = (1 - phase) * 6 - 0.5;
    const obstacle = row === 2 ? Math.max(0, 1 - Math.abs(pos - col)) : 0;
    // The runner sits in column 1 and hops as the obstacle reaches it.
    const hop = pulse(phase, 0.74, 0.13);
    const runner = col === 1 ? (row === 2 ? 1 - hop : row === 1 ? hop : 0) : 0;
    const v = Math.max(obstacle * 0.7, runner);
    return { o: lit(v), s: 0.75 + 0.35 * v };
  },
};
