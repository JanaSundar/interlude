import { randInt, type Rng } from '../core/random';

/** Logical board size; the ground line sits GROUND units down from the top. */
export const W = 240;
export const H = 150;
export const GROUND = 122;

export const DINO_X = 24;
export const DINO_W = 14;
export const DINO_H = 16;
/** Forgiveness: the hitbox is a little smaller than the sprite on each side. */
const MARGIN = 2;

/** Launch speed and gravity, in units per ms. A full hop peaks at 44 units and lasts 600ms. */
export const JUMP_V = 0.2933;
export const GRAVITY = 0.000978;
export const AIR_MS = (2 * JUMP_V) / GRAVITY;
/** Letting go of jump while rising pulls the dino down faster, for short hops. */
const SHORT_HOP = 2.4;

const SPEED_START = 0.09;
const SPEED_MAX = 0.21;
const SPEED_GAIN = 0.00002;

export type Obstacle = { id: number; x: number; w: number; h: number };

export type DinoState = {
  /** The world stays still until the first jump. */
  started: boolean;
  /** Height of the dino's feet above the ground. */
  y: number;
  vy: number;
  obstacles: Obstacle[];
  /** Distance left to run before the next obstacle enters from the right. */
  untilSpawn: number;
  distance: number;
  speed: number;
  over: boolean;
  nextId: number;
};

export const createDino = (rng: Rng): DinoState => ({
  started: false,
  y: 0,
  vy: 0,
  obstacles: [],
  untilSpawn: 60 + rng() * 60,
  distance: 0,
  speed: SPEED_START,
  over: false,
  nextId: 1,
});

/** Pure: how fast the world scrolls after `distance` units, up to a cap. */
export const speedAt = (distance: number) =>
  Math.min(SPEED_MAX, SPEED_START + distance * SPEED_GAIN);

/** Pure: the score shown for a distance. */
export const scoreOf = (distance: number) => Math.floor(distance / 10);

const WIDTHS = [6, 10, 14] as const;
const HEIGHTS = [10, 14, 18] as const;

/**
 * Space between one obstacle's front edge and the next one's. Always long
 * enough to land from a full hop and start another, however fast it's going.
 */
const spacing = (speed: number, width: number, rng: Rng) =>
  speed * AIR_MS * 1.2 + width + 24 + rng() * 50;

const spawn = (state: DinoState, rng: Rng): DinoState => {
  const w = WIDTHS[randInt(rng, WIDTHS.length)]!;
  const h = HEIGHTS[randInt(rng, HEIGHTS.length)]!;
  return {
    ...state,
    obstacles: [...state.obstacles, { id: state.nextId, x: W, w, h }],
    nextId: state.nextId + 1,
    untilSpawn: spacing(state.speed, w, rng),
  };
};

/** Pure: does an obstacle touch a dino whose feet are `y` above the ground? */
export const hits = (y: number, o: Obstacle): boolean =>
  o.x < DINO_X + DINO_W - MARGIN && o.x + o.w > DINO_X + MARGIN && y < o.h - MARGIN;

/**
 * Advance by `dt` ms. `jump` is whether the jump control is held: pressing it
 * on the ground launches, and releasing it early cuts the hop short.
 */
export function step(state: DinoState, input: { jump: boolean }, dt: number, rng: Rng): DinoState {
  if (state.over) return state;
  if (!state.started && !input.jump) return state;

  let { y, vy } = state;
  if (input.jump && y === 0) vy = JUMP_V;
  const gravity = GRAVITY * (!input.jump && vy > 0 ? SHORT_HOP : 1);
  vy -= gravity * dt;
  y += vy * dt;
  if (y <= 0) {
    y = 0;
    vy = 0;
  }

  const run = state.speed * dt;
  const obstacles = state.obstacles
    .map((o) => ({ ...o, x: o.x - run }))
    .filter((o) => o.x + o.w > 0);
  const distance = state.distance + run;
  let next: DinoState = {
    ...state,
    started: true,
    y,
    vy,
    obstacles,
    distance,
    speed: speedAt(distance),
    untilSpawn: state.untilSpawn - run,
  };
  if (next.untilSpawn <= 0) next = spawn(next, rng);
  return obstacles.some((o) => hits(y, o)) ? { ...next, over: true } : next;
}
