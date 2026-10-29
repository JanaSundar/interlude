import type { DotPattern } from '../primitives/dot-matrix';
import { lit, pulse } from '../primitives/patterns';

/** A fixed, irregular order so the pops feel random but stay calm. */
const ORDER = [4, 0, 8, 2, 6, 1, 7, 3, 5];
const SLOT = ORDER.map((_, cell) => ORDER.indexOf(cell));

/** Dots pop up one at a time in scattered holes. */
export const whackPattern: DotPattern = {
  cols: 3,
  rows: 3,
  period: 2.7,
  frame: (phase, col, row) => {
    const slot = SLOT[row * 3 + col] as number;
    const v = pulse(phase, (slot + 0.5) / ORDER.length, 0.09);
    return { o: lit(v), s: 0.7 + 0.45 * v, y: (1 - v) * 0.12 };
  },
};
