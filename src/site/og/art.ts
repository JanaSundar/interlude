import type { DotPattern } from '@registry/components/interlude/primitives/dot-matrix';

export type ArtDot = { x: number; y: number; r: number; o: number };

/** The dot animation is frozen here: a frame where most patterns show some of their motion. */
export const ART_PHASE = 0.35;

/**
 * Pure: the pattern at one instant, as circles inside a `size` × `size` box.
 * Cells are square and the grid is centred, so any pattern shape fits.
 */
export function patternDots(pattern: DotPattern, size: number, phase = ART_PHASE): ArtDot[] {
  const cell = size / Math.max(pattern.cols, pattern.rows);
  const left = (size - cell * pattern.cols) / 2;
  const top = (size - cell * pattern.rows) / 2;
  const dots: ArtDot[] = [];
  for (let row = 0; row < pattern.rows; row++) {
    for (let col = 0; col < pattern.cols; col++) {
      const f = pattern.frame(phase, col, row);
      dots.push({
        x: left + (col + 0.5 + (f.x ?? 0)) * cell,
        y: top + (row + 0.5 + (f.y ?? 0)) * cell,
        r: cell * 0.3 * (f.s ?? 1),
        o: f.o,
      });
    }
  }
  return dots;
}
