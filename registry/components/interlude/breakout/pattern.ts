import type { DotPattern } from '../primitives/dot-matrix';
import { lit } from '../primitives/patterns';

/**
 * A top row of dots dims one by one as a dot rises to meet each of them,
 * then the row quietly rebuilds.
 */
export const breakoutPattern: DotPattern = {
  cols: 4,
  rows: 4,
  period: 2.4,
  frame: (phase, col, row) => {
    const beat = phase * 4;
    const current = Math.floor(beat);
    const t = beat - current;
    if (row === 0) {
      if (col < current) return { o: lit(0.05) };
      if (col === current)
        return { o: lit(t < 0.8 ? 0.85 : 0.85 * (1 - (t - 0.8) / 0.2)), s: t > 0.8 ? 1.25 : 1 };
      return { o: lit(0.85) };
    }
    // The rising dot travels up the column currently being "hit".
    if (col === current) {
      const y = 3 - t * 3.2;
      const near = Math.max(0, 1 - Math.abs(y - row));
      return { o: lit(near), s: 0.8 + 0.2 * near };
    }
    return { o: lit(0), s: 0.8 };
  },
};
