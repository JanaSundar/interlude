import { delta, opposite, type Direction } from '../core/input';
import { randInt, type Rng } from '../core/random';

export const COLS = 16;
export const ROWS = 12;

export type Point = { x: number; y: number };

/** Board dimensions in cells; the default is the 16×12 loader game. */
export type Size = { cols: number; rows: number };
export const BOARD: Size = { cols: COLS, rows: ROWS };

export type SnakeState = {
  snake: Point[];
  /** Previous positions, for interpolated rendering between steps. */
  prev: Point[];
  dir: Direction;
  queue: Direction[];
  food: Point;
  score: number;
  over: boolean;
  won: boolean;
};

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

export function placeFood(snake: Point[], rng: Rng, { cols, rows }: Size = BOARD): Point | null {
  const taken = new Set(snake.map((p) => p.y * cols + p.x));
  const free: Point[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!taken.has(y * cols + x)) free.push({ x, y });
    }
  }
  return free.length ? (free[randInt(rng, free.length)] ?? null) : null;
}

export function createSnake(rng: Rng, size: Size = BOARD): SnakeState {
  const y = Math.floor(size.rows / 2);
  const snake = [
    { x: 4, y },
    { x: 3, y },
    { x: 2, y },
  ];
  return {
    snake,
    prev: snake,
    dir: 'right',
    queue: [],
    food: placeFood(snake, rng, size) ?? { x: 0, y: 0 },
    score: 0,
    over: false,
    won: false,
  };
}

/** Queue a turn; reversing into yourself and duplicates are ignored. */
export function turn(state: SnakeState, dir: Direction): SnakeState {
  const last = state.queue.at(-1) ?? state.dir;
  if (dir === last || dir === opposite[last] || state.queue.length >= 2) return state;
  return { ...state, queue: [...state.queue, dir] };
}

export function step(state: SnakeState, rng: Rng, size: Size = BOARD): SnakeState {
  if (state.over) return state;
  const [dir = state.dir, ...queue] = state.queue.length ? state.queue : [state.dir];
  const head = state.snake[0] as Point;
  const [dx, dy] = delta[dir];
  // The board wraps: leaving one edge re-enters from the opposite one.
  const next = {
    x: (head.x + dx + size.cols) % size.cols,
    y: (head.y + dy + size.rows) % size.rows,
  };
  const eats = same(next, state.food);
  // The tail moves away this step unless we grow, so it's not an obstacle.
  const body = eats ? state.snake : state.snake.slice(0, -1);
  if (body.some((p) => same(p, next))) {
    return { ...state, prev: state.snake, dir, queue, over: true };
  }
  const snake = [next, ...body];
  const food = eats ? placeFood(snake, rng, size) : state.food;
  return {
    ...state,
    snake,
    prev: state.snake,
    dir,
    queue,
    food: food ?? state.food,
    score: state.score + (eats ? 1 : 0),
    over: food === null,
    won: food === null,
  };
}

/** Shortest signed step from `from` to `to` on a wrapping axis of `size`. */
export function wrapDelta(from: number, to: number, size: number): number {
  const d = to - from;
  return d > size / 2 ? d - size : d < -size / 2 ? d + size : d;
}

/** Steps get quicker as the snake grows, with a floor. */
export function stepInterval(score: number, speed: number): number {
  return Math.max(70, 140 - score * 3) / speed;
}
