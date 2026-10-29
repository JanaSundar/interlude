import { describe, expect, it } from 'vite-plus/test';
import { createRng } from '../core/random';
import { canMove, createMerge, move, slide, type MergeState, type Tile } from './logic';

const board = (rows: number[][]): MergeState => {
  const tiles: Tile[] = [];
  let id = 1;
  rows.forEach((row, r) =>
    row.forEach((value, c) => value && tiles.push({ id: id++, value, row: r, col: c })),
  );
  return { tiles, score: 0, nextId: id, won: false, over: false };
};
const values = (s: MergeState) => {
  const grid = [0, 1, 2, 3].map(() => [0, 0, 0, 0]);
  for (const t of s.tiles) if (!t.consumed) grid[t.row]![t.col] = t.value;
  return grid;
};

describe('2048', () => {
  it('starts with two tiles', () => {
    expect(createMerge(createRng(1)).tiles).toHaveLength(2);
  });

  it('slides and merges a pair once per move', () => {
    const { state, moved } = slide(board([[2, 2, 2, 2], [0], [0], [0]]), 'left');
    expect(moved).toBe(true);
    expect(values(state)[0]).toEqual([4, 4, 0, 0]);
    expect(state.score).toBe(8);
  });

  it('does not chain merges', () => {
    const { state } = slide(board([[4, 2, 2, 0], [0], [0], [0]]), 'left');
    expect(values(state)[0]).toEqual([4, 4, 0, 0]);
  });

  it('merges towards the direction of travel', () => {
    const { state } = slide(board([[2, 2, 2, 0], [0], [0], [0]]), 'right');
    expect(values(state)[0]).toEqual([0, 0, 2, 4]);
  });

  it('moves columns up and down', () => {
    const { state } = slide(board([[2], [0], [2], [4]]), 'down');
    expect(values(state).map((r) => r[0])).toEqual([0, 0, 4, 4]);
  });

  it('only spawns after a real move', () => {
    const s = board([[2, 4, 0, 0], [0], [0], [0]]);
    expect(move(s, 'left', createRng(1))).toBe(s);
    expect(move(s, 'right', createRng(1)).tiles.filter((t) => !t.consumed)).toHaveLength(3);
  });

  it('detects the end of the game', () => {
    const stuck = board([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    expect(canMove(stuck.tiles)).toBe(false);
    const open = board([
      [2, 2, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    expect(canMove(open.tiles)).toBe(true);
  });

  it('flags the win at 2048', () => {
    expect(slide(board([[1024, 1024, 0, 0], [0], [0], [0]]), 'left').state.won).toBe(true);
  });
});
