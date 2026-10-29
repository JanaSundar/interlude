import type { DotPattern } from '../primitives/dot-matrix';
import { lit, pulse } from '../primitives/patterns';

/**
 * A single dot rallies across the middle row; the edge dots it touches
 * brighten for a beat, like a quiet volley.
 */
export const pongPattern: DotPattern = {
  cols: 5,
  rows: 3,
  period: 1.6,
  frame: (phase, col, row) => {
    // Triangle wave: 0 → 4 → 0 across the cycle.
    const pos = phase < 0.5 ? phase * 8 : (1 - phase) * 8;
    if (row === 1) {
      const near = Math.max(0, 1 - Math.abs(pos - col));
      return { o: lit(near), s: 0.8 + 0.3 * near };
    }
    const edgeHit = col === 0 ? pulse(phase, 0, 0.12) : col === 4 ? pulse(phase, 0.5, 0.12) : 0;
    return { o: lit(edgeHit * 0.7), s: 0.85 };
  },
};
