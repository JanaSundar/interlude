import { randInt, shuffle, type Rng } from '../core/random';

export const COLS = 10;
export const ROWS = 16;

/** Seven original tetromino-style pieces as cells inside their rotation box. */
const SHAPES: { size: number; cells: [number, number][] }[] = [
  {
    size: 4,
    cells: [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
  },
  {
    size: 2,
    cells: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  },
  {
    size: 3,
    cells: [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
  {
    size: 3,
    cells: [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
  },
  {
    size: 3,
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
  },
  {
    size: 3,
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
  {
    size: 3,
    cells: [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
];
export const KINDS = SHAPES.length;

export type Piece = { kind: number; rot: number; x: number; y: number };

export type BlocksState = {
  /** Row-major; 0 is empty, otherwise kind + 1. */
  board: number[];
  piece: Piece;
  next: number;
  bag: number[];
  score: number;
  lines: number;
  over: boolean;
  /** Rows removed by the most recent lock, for the clear effect. */
  cleared: number[];
  clears: number;
};

export function pieceCells({ kind, rot, x, y }: Piece): [number, number][] {
  const shape = SHAPES[kind] ?? SHAPES[0]!;
  return shape.cells.map(([cx, cy]) => {
    let px = cx;
    let py = cy;
    for (let r = 0; r < ((rot % 4) + 4) % 4; r++) [px, py] = [shape.size - 1 - py, px];
    return [x + px, y + py];
  });
}

export function collides(board: number[], piece: Piece): boolean {
  return pieceCells(piece).some(
    ([x, y]) => x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y * COLS + x] !== 0),
  );
}

function draw(bag: number[], rng: Rng): [number, number[]] {
  const pool = bag.length ? bag : shuffle(rng, [...Array(KINDS).keys()]);
  return [pool[0] ?? randInt(rng, KINDS), pool.slice(1)];
}

const spawn = (kind: number): Piece => ({ kind, rot: 0, x: 3, y: -1 });

export function createBlocks(rng: Rng): BlocksState {
  const [first, bag1] = draw([], rng);
  const [next, bag] = draw(bag1, rng);
  return {
    board: Array(COLS * ROWS).fill(0),
    piece: spawn(first),
    next,
    bag,
    score: 0,
    lines: 0,
    over: false,
    cleared: [],
    clears: 0,
  };
}

function tryPiece(state: BlocksState, piece: Piece): BlocksState {
  return state.over || collides(state.board, piece) ? state : { ...state, piece };
}

export const move = (s: BlocksState, dx: number) => tryPiece(s, { ...s.piece, x: s.piece.x + dx });

/** Rotate clockwise, nudging sideways if the wall or stack is in the way. */
export function rotate(state: BlocksState): BlocksState {
  if (state.over) return state;
  for (const kick of [0, -1, 1, -2, 2]) {
    const piece = { ...state.piece, rot: state.piece.rot + 1, x: state.piece.x + kick };
    if (!collides(state.board, piece)) return { ...state, piece };
  }
  return state;
}

const LINE_POINTS = [0, 100, 300, 500, 800];

export function lock(state: BlocksState, rng: Rng): BlocksState {
  const board = [...state.board];
  for (const [x, y] of pieceCells(state.piece)) {
    if (y < 0) return { ...state, over: true };
    board[y * COLS + x] = state.piece.kind + 1;
  }
  const cleared: number[] = [];
  const rows: number[][] = [];
  for (let y = 0; y < ROWS; y++) {
    const row = board.slice(y * COLS, (y + 1) * COLS);
    if (row.every((c) => c !== 0)) cleared.push(y);
    else rows.push(row);
  }
  const empty = Array.from({ length: cleared.length }, () => Array(COLS).fill(0) as number[]);
  const [next, bag] = draw(state.bag, rng);
  const piece = spawn(state.next);
  const nextBoard = [...empty, ...rows].flat();
  return {
    ...state,
    board: nextBoard,
    piece,
    next,
    bag,
    score: state.score + (LINE_POINTS[cleared.length] ?? 0),
    lines: state.lines + cleared.length,
    cleared,
    clears: state.clears + (cleared.length ? 1 : 0),
    over: collides(nextBoard, piece),
  };
}

/** Gravity / soft drop: fall one row, or lock in place. */
export function fall(state: BlocksState, rng: Rng): BlocksState {
  if (state.over) return state;
  const piece = { ...state.piece, y: state.piece.y + 1 };
  return collides(state.board, piece) ? lock(state, rng) : { ...state, piece };
}

export function hardDrop(state: BlocksState, rng: Rng): BlocksState {
  if (state.over) return state;
  let piece = state.piece;
  while (!collides(state.board, { ...piece, y: piece.y + 1 })) piece = { ...piece, y: piece.y + 1 };
  return lock({ ...state, piece, score: state.score + (piece.y - state.piece.y) }, rng);
}

export const gravityInterval = (lines: number, speed: number) =>
  Math.max(110, 650 - Math.floor(lines / 5) * 60) / speed;
