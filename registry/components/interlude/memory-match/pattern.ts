import type { DotPattern } from '../primitives/dot-matrix';
import { lit, pulse } from '../primitives/patterns';

/** Pairs of dots turn over together (a horizontal squash) in a slow round. */
const PAIRS: [number, number][][] = [
  [
    [0, 0],
    [2, 2],
  ],
  [
    [2, 0],
    [0, 2],
  ],
  [
    [1, 0],
    [1, 2],
  ],
  [
    [0, 1],
    [2, 1],
  ],
];

export const memoryPattern: DotPattern = {
  cols: 3,
  rows: 3,
  period: 2.8,
  frame: (phase, col, row) => {
    const pair = PAIRS.findIndex((p) => p.some(([x, y]) => x === col && y === row));
    if (pair === -1) return { o: lit(0.35 + 0.25 * Math.sin(phase * Math.PI * 2)) };
    const v = pulse(phase, (pair + 0.5) / PAIRS.length, 0.12);
    // Squash towards zero width at the midpoint of the "flip".
    return { o: lit(0.25 + 0.75 * v), s: 1 - 0.6 * Math.sin(v * Math.PI) };
  },
};
