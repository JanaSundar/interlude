import type { DotPattern } from '../primitives/dot-matrix';
import { lit } from '../primitives/patterns';

/**
 * A steady stream of dots rises up the centre column from a still base,
 * like quiet tracer fire. The outer columns twinkle faintly.
 */
export const shooterPattern: DotPattern = {
  cols: 3,
  rows: 4,
  period: 1.2,
  frame: (phase, col, row) => {
    if (col !== 1) {
      const twinkle = Math.max(0, Math.sin((phase + col * 0.37 + row * 0.21) * Math.PI * 2));
      return { o: lit(twinkle * 0.25), s: 0.7 };
    }
    if (row === 3) return { o: lit(0.9) };
    // Two shots in flight per cycle, travelling from row 3 to row 0.
    const shots = [phase, (phase + 0.5) % 1].map((p) => 3 - p * 3.6);
    const near = Math.max(...shots.map((y) => Math.max(0, 1 - Math.abs(y - row) * 1.4)));
    return { o: lit(near), s: 0.7 + 0.3 * near };
  },
};
