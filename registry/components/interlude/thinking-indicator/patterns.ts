import type { DotPattern } from '../primitives/dot-matrix';
import { lit, pulse } from '../primitives/patterns';

/** Clockwise ring around the centre of a 3×3 grid. */
const RING = [
  [0, 0],
  [1, 0],
  [2, 0],
  [2, 1],
  [2, 2],
  [1, 2],
  [0, 2],
  [0, 1],
];
const ringIndex = (col: number, row: number) => RING.findIndex(([c, r]) => c === col && r === row);

const grid = (period: number, frame: DotPattern['frame']): DotPattern => ({
  cols: 3,
  rows: 3,
  period,
  frame,
});

/** One shape of motion per observable state, so states read apart without labels. */
export const thinkingPatterns = {
  // A light circling a steady core.
  thinking: grid(1.6, (phase, col, row) => {
    const i = ringIndex(col, row);
    if (i < 0) return { o: lit(0.55) };
    return { o: lit(pulse(phase, i / RING.length, 0.2)) };
  }),
  // Rows filling top to bottom.
  generating: grid(1.2, (phase, _col, row) => ({ o: lit(pulse(phase, row / 3, 0.3)) })),
  // Columns typing left to right.
  streaming: grid(0.9, (phase, col) => ({ o: lit(pulse(phase, col / 3, 0.28)) })),
  // Opposite corners trading a signal, like a request and its reply.
  tool: grid(1.4, (phase, col, row) => {
    const corner = (col === 0 && row === 0) || (col === 2 && row === 2);
    const other = (col === 2 && row === 0) || (col === 0 && row === 2);
    if (corner) return { o: lit(pulse(phase, 0, 0.25)) };
    if (other) return { o: lit(pulse(phase, 0.5, 0.25)) };
    return { o: lit(col === 1 && row === 1 ? 0.4 : 0) };
  }),
} satisfies Record<string, DotPattern>;
