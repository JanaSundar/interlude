import type { DotPattern } from '../primitives/dot-matrix';
import { clamp01 } from '../primitives/math';
import { ease, lit } from '../primitives/patterns';

/** Progress of `phase` through [from, to], clamped to 0..1. */
const span = (phase: number, from: number, to: number) => clamp01((phase - from) / (to - from));

/**
 * Two dots slide in from opposite edges and merge in the centre: the merged
 * dot pops a little larger and brighter, rests, then dissolves. The first
 * half of the cycle merges across the row, the second half down the column.
 */
export const mergePattern: DotPattern = {
  cols: 3,
  rows: 3,
  period: 3.2,
  frame: (phase, col, row) => {
    const vertical = phase >= 0.5;
    const p = (phase % 0.5) / 0.5;
    const slide = ease(span(p, 0.05, 0.4));
    const pop = span(p, 0.4, 0.5);
    const fade = span(p, 0.8, 1);
    const isCentre = col === 1 && row === 1;
    // The pair for this half: the two edge dots on the merge axis.
    const isPair = vertical ? col === 1 && row !== 1 : row === 1 && col !== 1;

    if (isPair) {
      if (p >= 0.4) return { o: lit(0), s: 0.6 };
      const towards = vertical ? (row === 0 ? 1 : -1) : col === 0 ? 1 : -1;
      const d = towards * slide;
      return { o: lit(0.75 + 0.25 * slide), x: vertical ? 0 : d, y: vertical ? d : 0 };
    }
    if (isCentre) {
      if (p < 0.4) return { o: lit(0.05), s: 0.7 };
      // Pop past full size, settle slightly enlarged, then dissolve.
      const s = 1.3 + 0.25 * Math.sin(pop * Math.PI);
      return { o: lit(1 - fade), s: s * (1 - 0.3 * fade) };
    }
    return { o: lit(0.04), s: 0.7 };
  },
};
