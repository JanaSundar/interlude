import { delta, type Direction } from '../core/input';
import { pick, type Rng } from '../core/random';

export const N = 3;
/** Row-major tiles; 0 is the gap. */
export type Tiles = number[];
export type SlidingState = { tiles: Tiles; moves: number };

export const SOLVED: Tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];

export const isSolved = (tiles: Tiles) => tiles.every((t, i) => t === SOLVED[i]);

/** For odd widths a layout is solvable iff its inversion count is even. */
export function isSolvable(tiles: Tiles): boolean {
  const values = tiles.filter((t) => t !== 0);
  let inversions = 0;
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++)
      if ((values[i] as number) > (values[j] as number)) inversions++;
  }
  return inversions % 2 === 0;
}

const neighbours = (index: number) => {
  const r = Math.floor(index / N);
  const c = index % N;
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ]
    .filter(([y, x]) => y! >= 0 && y! < N && x! >= 0 && x! < N)
    .map(([y, x]) => y! * N + x!);
};

/** Slide the tile at `index` into the gap if they're adjacent. */
export function slideTile(state: SlidingState, index: number): SlidingState {
  const gap = state.tiles.indexOf(0);
  if (!neighbours(gap).includes(index)) return state;
  const tiles = [...state.tiles];
  [tiles[gap], tiles[index]] = [tiles[index] as number, 0];
  return { tiles, moves: state.moves + 1 };
}

/** Arrow keys move the tile that sits opposite the arrow into the gap. */
export function slideDirection(state: SlidingState, dir: Direction): SlidingState {
  const gap = state.tiles.indexOf(0);
  const [dx, dy] = delta[dir];
  const r = Math.floor(gap / N) - dy;
  const c = (gap % N) - dx;
  if (r < 0 || r >= N || c < 0 || c >= N) return state;
  return slideTile(state, r * N + c);
}

/** A random walk from the solved board is always solvable. */
export function shuffled(rng: Rng, steps = 80): Tiles {
  let tiles = [...SOLVED];
  let previous = -1;
  for (let i = 0; i < steps || isSolved(tiles); i++) {
    const gap = tiles.indexOf(0);
    const options = neighbours(gap).filter((n) => n !== previous);
    const next = pick(rng, options);
    tiles = slideTile({ tiles, moves: 0 }, next).tiles;
    previous = gap;
  }
  return tiles;
}

export const createSliding = (rng: Rng): SlidingState => ({ tiles: shuffled(rng), moves: 0 });
