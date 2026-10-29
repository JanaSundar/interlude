import type { Rng } from '../core/random';
import { clamp } from '../primitives/math';

export const W = 200;
export const H = 220;
export const SHIP_Y = H - 16;
export const SHIP_W = 14;
export const ENEMY_R = 6;
const SHIP_SPEED = 0.18;
const BULLET_SPEED = 0.32;
const COOLDOWN = 260;
const INVULNERABLE = 1200;

export type Point = { x: number; y: number };
export type Enemy = Point & { id: number; phase: number };
export type ShooterState = {
  x: number;
  bullets: Point[];
  enemies: Enemy[];
  time: number;
  spawnIn: number;
  cooldown: number;
  invulnerable: number;
  nextId: number;
  score: number;
  lives: number;
  over: boolean;
};
export type ShooterInput = { dir: -1 | 0 | 1; target: number | null; fire: boolean };

export function createShooter(): ShooterState {
  return {
    x: W / 2,
    bullets: [],
    enemies: [],
    time: 0,
    spawnIn: 600,
    cooldown: 0,
    invulnerable: 0,
    nextId: 1,
    score: 0,
    lives: 3,
    over: false,
  };
}

/** Enemies descend faster and arrive more often as time passes. */
export const enemySpeed = (time: number) => 0.035 + Math.min(time / 60_000, 1) * 0.045;
const spawnGap = (time: number, rng: Rng) => Math.max(380, 1100 - time / 50) + rng() * 400;

export function step(
  state: ShooterState,
  input: ShooterInput,
  dt: number,
  rng: Rng,
): { state: ShooterState; hits: Point[]; damaged: boolean } {
  if (state.over) return { state, hits: [], damaged: false };
  const time = state.time + dt;
  const desired = input.target ?? state.x + input.dir * SHIP_SPEED * dt;
  const x = clamp(
    state.x + clamp(desired - state.x, -SHIP_SPEED * 1.5 * dt, SHIP_SPEED * 1.5 * dt),
    SHIP_W / 2,
    W - SHIP_W / 2,
  );

  let bullets = state.bullets
    .map((b) => ({ x: b.x, y: b.y - BULLET_SPEED * dt }))
    .filter((b) => b.y > -4);
  let cooldown = Math.max(0, state.cooldown - dt);
  if (input.fire && cooldown === 0) {
    bullets = [...bullets, { x, y: SHIP_Y - 8 }];
    cooldown = COOLDOWN;
  }

  let { nextId } = state;
  const speed = enemySpeed(time);
  let enemies = state.enemies.map((e) => ({
    ...e,
    y: e.y + speed * dt,
    x: clamp(e.x + Math.sin((time + e.phase) / 400) * 0.02 * dt, ENEMY_R, W - ENEMY_R),
  }));
  let spawnIn = state.spawnIn - dt;
  if (spawnIn <= 0) {
    enemies = [
      ...enemies,
      { id: nextId++, x: ENEMY_R + rng() * (W - ENEMY_R * 2), y: -ENEMY_R, phase: rng() * 2000 },
    ];
    spawnIn = spawnGap(time, rng);
  }

  const hits: Point[] = [];
  const spent = new Set<Point>();
  enemies = enemies.filter((e) => {
    const bullet = bullets.find(
      (b) =>
        !spent.has(b) && Math.abs(b.x - e.x) < ENEMY_R + 1.5 && Math.abs(b.y - e.y) < ENEMY_R + 3,
    );
    if (!bullet) return true;
    spent.add(bullet);
    hits.push({ x: e.x, y: e.y });
    return false;
  });
  bullets = bullets.filter((b) => !spent.has(b));

  // Contact with the ship or slipping past the bottom costs a life.
  let invulnerable = Math.max(0, state.invulnerable - dt);
  let damaged = false;
  enemies = enemies.filter((e) => {
    const touches =
      Math.abs(e.x - x) < ENEMY_R + SHIP_W / 2 && Math.abs(e.y - SHIP_Y) < ENEMY_R + 4;
    if (!touches && e.y < H + ENEMY_R) return true;
    if (invulnerable === 0) {
      damaged = true;
      invulnerable = INVULNERABLE;
    }
    return false;
  });
  const lives = state.lives - (damaged ? 1 : 0);

  return {
    state: {
      x,
      bullets,
      enemies,
      time,
      spawnIn,
      cooldown,
      invulnerable,
      nextId,
      score: state.score + hits.length * 10,
      lives,
      over: lives <= 0,
    },
    hits,
    damaged,
  };
}
