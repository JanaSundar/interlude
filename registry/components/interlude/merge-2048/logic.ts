import type { Direction } from '../core/input';
import { randInt, type Rng } from '../core/random';

export const SIZE = 4;
export const GOAL = 2048;

export type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
  /** Created by a merge this turn (pop animation). */
  merged?: boolean;
  /** Spawned this turn. */
  fresh?: boolean;
  /** Absorbed by a merge: slides into place, then fades and is pruned next turn. */
  consumed?: boolean;
};

export type MergeState = {
  tiles: Tile[];
  score: number;
  nextId: number;
  won: boolean;
  over: boolean;
};

const live = (tiles: Tile[]) => tiles.filter((t) => !t.consumed);

/** Cells of each line, ordered from the edge tiles slide towards. */
function lines(dir: Direction): [number, number][][] {
  return Array.from({ length: SIZE }, (_, i) =>
    Array.from({ length: SIZE }, (_, k): [number, number] => {
      const j = dir === 'right' || dir === 'down' ? SIZE - 1 - k : k;
      return dir === 'left' || dir === 'right' ? [i, j] : [j, i];
    }),
  );
}

export function spawn(state: MergeState, rng: Rng): MergeState {
  const taken = new Set(live(state.tiles).map((t) => t.row * SIZE + t.col));
  const free = [...Array(SIZE * SIZE).keys()].filter((i) => !taken.has(i));
  if (!free.length) return state;
  const cell = free[randInt(rng, free.length)] as number;
  const tile: Tile = {
    id: state.nextId,
    value: rng() < 0.9 ? 2 : 4,
    row: Math.floor(cell / SIZE),
    col: cell % SIZE,
    fresh: true,
  };
  return { ...state, tiles: [...state.tiles, tile], nextId: state.nextId + 1 };
}

export function createMerge(rng: Rng): MergeState {
  return spawn(spawn({ tiles: [], score: 0, nextId: 1, won: false, over: false }, rng), rng);
}

export function canMove(tiles: Tile[]): boolean {
  const grid = new Map(live(tiles).map((t) => [t.row * SIZE + t.col, t.value]));
  if (grid.size < SIZE * SIZE) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = grid.get(r * SIZE + c);
      if (c + 1 < SIZE && grid.get(r * SIZE + c + 1) === v) return true;
      if (r + 1 < SIZE && grid.get((r + 1) * SIZE + c) === v) return true;
    }
  }
  return false;
}

/** Slide and merge; each tile merges at most once per move. */
export function slide(state: MergeState, dir: Direction): { state: MergeState; moved: boolean } {
  const tiles = live(state.tiles).map(({ merged: _m, fresh: _f, ...t }) => t);
  const at = new Map(tiles.map((t) => [t.row * SIZE + t.col, t]));
  const out: Tile[] = [];
  let gained = 0;
  let moved = false;

  for (const line of lines(dir)) {
    let placed: Tile | undefined;
    let k = 0;
    for (const [r, c] of line) {
      const tile = at.get(r * SIZE + c);
      if (!tile) continue;
      if (placed && !placed.merged && placed.value === tile.value) {
        placed.value *= 2;
        placed.merged = true;
        gained += placed.value;
        out.push({ ...tile, row: placed.row, col: placed.col, consumed: true });
        moved = true;
        continue;
      }
      const [tr, tc] = line[k++] as [number, number];
      if (tr !== tile.row || tc !== tile.col) moved = true;
      placed = { ...tile, row: tr, col: tc };
      out.push(placed);
    }
  }
  const next = { ...state, tiles: out, score: state.score + gained };
  return { state: { ...next, won: state.won || out.some((t) => t.value >= GOAL) }, moved };
}

export function move(state: MergeState, dir: Direction, rng: Rng): MergeState {
  if (state.over) return state;
  const { state: slid, moved } = slide(state, dir);
  if (!moved) return state;
  const next = spawn(slid, rng);
  return { ...next, over: !canMove(next.tiles) };
}
