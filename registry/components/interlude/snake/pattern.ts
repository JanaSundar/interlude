import type { DotPattern } from '../primitives/dot-matrix';
import { lit } from '../primitives/patterns';

/** Clockwise walk around the 4×4 border. */
const PATH = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [3, 1],
  [3, 2],
  [3, 3],
  [2, 3],
  [1, 3],
  [0, 3],
  [0, 2],
  [0, 1],
] as const;
const TRAIL = 4;

/** A short trail stepping around the border, like something hungry pacing. */
export const snakePattern: DotPattern = {
  cols: 4,
  rows: 4,
  period: 1.8,
  frame: (phase, col, row) => {
    const index = PATH.findIndex(([x, y]) => x === col && y === row);
    if (index === -1) return { o: lit(0), s: 0.8 };
    const head = Math.floor(phase * PATH.length);
    const behind = (head - index + PATH.length) % PATH.length;
    const v = behind < TRAIL ? 1 - behind / TRAIL : 0;
    return { o: lit(v), s: 0.85 + 0.15 * v };
  },
};
