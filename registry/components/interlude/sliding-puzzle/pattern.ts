import type { DotPattern } from '../primitives/dot-matrix';
import { ease, lit } from '../primitives/patterns';

/**
 * A 3×3 field with one empty slot. The gap travels around the ring and each
 * neighbouring dot slides into it in turn.
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

export const slidingPattern: DotPattern = {
  cols: 3,
  rows: 3,
  period: 3.2,
  frame: (phase, col, row) => {
    if (col === 1 && row === 1) return { o: lit(0.5), s: 0.9 };
    const index = RING.findIndex(([x, y]) => x === col && y === row);
    const beat = phase * RING.length;
    const gap = Math.floor(beat) % RING.length;
    const t = ease(Math.min(1, (beat % 1) / 0.6));
    // The dot after the gap slides back into it; the gap moves forward.
    const mover = (gap + 1) % RING.length;
    if (index === gap) return { o: lit(0), s: 0.6 };
    if (index === mover) {
      const [gx, gy] = RING[gap]!;
      const [mx, my] = RING[mover]!;
      return { o: lit(0.9), x: (gx - mx) * t, y: (gy - my) * t };
    }
    return { o: lit(0.45) };
  },
};
