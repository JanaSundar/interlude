import { describe, expect, it } from 'vite-plus/test';
import { createRng } from '../core/random';
import { createSliding, isSolvable, isSolved, slideDirection, slideTile, SOLVED } from './logic';

describe('sliding puzzle', () => {
  it('always shuffles to a solvable, unsolved board', () => {
    for (let seed = 0; seed < 50; seed++) {
      const { tiles } = createSliding(createRng(seed));
      expect(isSolvable(tiles)).toBe(true);
      expect(isSolved(tiles)).toBe(false);
      const byValue = (a: number, b: number) => a - b;
      expect([...tiles].sort(byValue)).toEqual([...SOLVED].sort(byValue));
    }
  });

  it('recognises unsolvable layouts', () => {
    expect(isSolvable([2, 1, 3, 4, 5, 6, 7, 8, 0])).toBe(false);
  });

  it('only moves tiles next to the gap', () => {
    const s = { tiles: [...SOLVED], moves: 0 };
    expect(slideTile(s, 0)).toBe(s);
    const moved = slideTile(s, 7);
    expect(moved.tiles).toEqual([1, 2, 3, 4, 5, 6, 7, 0, 8]);
    expect(moved.moves).toBe(1);
  });

  it('moves the tile opposite an arrow into the gap', () => {
    const s = { tiles: [1, 2, 3, 4, 0, 5, 7, 8, 6], moves: 0 };
    expect(slideDirection(s, 'left').tiles).toEqual([1, 2, 3, 4, 5, 0, 7, 8, 6]);
    const solved = slideDirection(slideDirection(s, 'left'), 'up');
    expect(isSolved(solved.tiles)).toBe(true);
  });
});
