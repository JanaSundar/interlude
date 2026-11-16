import { clamp01 } from '../primitives/math';

export type Piece = {
  /** [col, row] of each cell once the piece has landed; row 0 is the top. */
  cells: readonly (readonly [number, number])[];
  /** Pieces differ by strength, never by hue, so one accent colours them all. */
  opacity: number;
};

export const WELL = 4;

/** Four pieces that fill the well exactly, in the order they fall. */
export const PIECES: readonly Piece[] = [
  {
    opacity: 0.55,
    cells: [
      [0, 3],
      [1, 3],
      [2, 3],
      [3, 3],
    ],
  },
  {
    opacity: 1,
    cells: [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2],
    ],
  },
  {
    opacity: 0.75,
    cells: [
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 2],
    ],
  },
  {
    opacity: 0.4,
    cells: [
      [2, 0],
      [3, 0],
      [3, 1],
      [3, 2],
    ],
  },
];

export const TETROMINO_PERIOD = 3.4;

/** Fractions of the cycle: one piece's fall, then the full well flashing and clearing. */
const DROP = 0.17;
const FLASH_AT = 0.78;
const FADE_AT = 0.84;
const GONE_AT = 0.92;

/** Pure: rows a piece starts above its resting place, enough to be out of the well. */
export const dropHeight = (piece: Piece): number =>
  Math.max(...piece.cells.map(([, row]) => row)) + 1;

/**
 * Pure: where a piece is at `phase`. `rise` is whole rows above its resting
 * place, so it falls a cell at a time; `opacity` carries the flash and the
 * clear once the well is full.
 */
export function pieceFrame(phase: number, index: number): { rise: number; opacity: number } {
  const piece = PIECES[index]!;
  const fallen = clamp01((phase - index * DROP) / DROP);
  const rise = Math.ceil((1 - fallen) * dropHeight(piece));
  if (phase < FLASH_AT) return { rise, opacity: piece.opacity };
  if (phase < FADE_AT) return { rise, opacity: 1 };
  return { rise, opacity: 1 - clamp01((phase - FADE_AT) / (GONE_AT - FADE_AT)) };
}

/** A phase with every piece landed, for the still frame. */
export const FULL_PHASE = 0.72;
