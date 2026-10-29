import { describe, expect, it } from 'vite-plus/test';
import { createRng } from '../core/random';
import {
  collides,
  COLS,
  createBlocks,
  fall,
  hardDrop,
  lock,
  move,
  pieceCells,
  rotate,
  ROWS,
  type BlocksState,
} from './logic';

const rng = () => createRng(7);

describe('falling blocks', () => {
  it('rotates a piece four times back to its shape', () => {
    const p = { kind: 2, rot: 0, x: 3, y: 3 };
    expect(pieceCells({ ...p, rot: 4 })).toEqual(pieceCells(p));
    expect(pieceCells({ ...p, rot: 1 })).not.toEqual(pieceCells(p));
  });

  it('stops at walls', () => {
    let s = createBlocks(rng());
    for (let i = 0; i < 20; i++) s = move(s, -1);
    expect(Math.min(...pieceCells(s.piece).map(([x]) => x))).toBe(0);
    expect(collides(s.board, { ...s.piece, x: s.piece.x - 1 })).toBe(true);
  });

  it('kicks off the wall when rotating would collide', () => {
    let s: BlocksState = { ...createBlocks(rng()), piece: { kind: 0, rot: 1, x: 0, y: 4 } };
    for (let i = 0; i < 5; i++) s = move(s, -1);
    const rotated = rotate(s);
    expect(collides(rotated.board, rotated.piece)).toBe(false);
    expect(rotated.piece.rot).toBe(s.piece.rot + 1);
  });

  it('hard drops to the floor and locks', () => {
    const s = createBlocks(rng());
    const dropped = hardDrop(s, rng());
    expect(dropped.board.slice((ROWS - 1) * COLS).some((c) => c !== 0)).toBe(true);
    expect(dropped.piece.kind).toBe(s.next);
  });

  it('clears full lines and scores them', () => {
    const base = createBlocks(rng());
    const board = Array(COLS * ROWS).fill(0);
    // Bottom row full except the four cells an I piece (kind 0, flat) will fill.
    for (let x = 4; x < COLS; x++) board[(ROWS - 1) * COLS + x] = 1;
    const s: BlocksState = { ...base, board, piece: { kind: 0, rot: 0, x: 0, y: ROWS - 2 } };
    const locked = lock(s, rng());
    expect(locked.cleared).toEqual([ROWS - 1]);
    expect(locked.lines).toBe(1);
    expect(locked.score).toBe(100);
    expect(locked.board.every((c) => c === 0)).toBe(true);
  });

  it('falls one row per gravity tick', () => {
    const s = createBlocks(rng());
    expect(fall(s, rng()).piece.y).toBe(s.piece.y + 1);
  });

  it('ends when a new piece can’t spawn', () => {
    const base = createBlocks(rng());
    const board = Array(COLS * ROWS).fill(1);
    for (let y = 0; y < ROWS; y++) board[y * COLS] = 0; // never a full row
    expect(lock({ ...base, board, piece: { kind: 1, rot: 0, x: 0, y: -1 } }, rng()).over).toBe(
      true,
    );
  });
});
