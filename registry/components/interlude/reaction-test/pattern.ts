import type { DotPattern } from '../primitives/dot-matrix';
import { lit } from '../primitives/patterns';

/**
 * The ring of dots slowly charges, holds still for a beat, then the centre
 * flashes — a held breath before a signal.
 */
const RING = [
  [0, 0],
  [1, 0],
  [2, 0],
  [2, 1],
  [2, 2],
  [1, 2],
  [0, 2],
  [0, 1],
] as const;

export const reactionPattern: DotPattern = {
  cols: 3,
  rows: 3,
  period: 2.6,
  frame: (phase, col, row) => {
    if (col === 1 && row === 1) {
      const flash = phase > 0.78 && phase < 0.9 ? 1 : 0;
      return { o: lit(flash || 0.25), s: flash ? 1.3 : 0.9 };
    }
    const index = RING.findIndex(([x, y]) => x === col && y === row);
    const charged = phase < 0.7 ? phase / 0.7 : phase < 0.9 ? 1 : 0;
    return { o: lit(index / RING.length < charged ? 0.6 : 0), s: 0.85 };
  },
};
