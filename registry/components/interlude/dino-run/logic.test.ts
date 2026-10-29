import { describe, expect, it } from 'vite-plus/test';
import { createRng } from '../core/random';
import {
  AIR_MS,
  createDino,
  DINO_W,
  DINO_X,
  hits,
  scoreOf,
  speedAt,
  step,
  type DinoState,
} from './logic';

const DT = 1000 / 120;
const rng = () => createRng(7);

/** Runs `ms` of game time, feeding `jump(state)` as the control each step. */
function run(state: DinoState, ms: number, jump: (s: DinoState) => boolean, r = rng()) {
  let s = state;
  let peak = 0;
  for (let t = 0; t < ms; t += DT) {
    s = step(s, { jump: jump(s) }, DT, r);
    peak = Math.max(peak, s.y);
  }
  return { state: s, peak };
}

describe('dino run', () => {
  it('stays still until the first jump', () => {
    const s = createDino(rng());
    expect(step(s, { jump: false }, 1000, rng())).toEqual(s);
    expect(step(s, { jump: true }, DT, rng()).started).toBe(true);
  });

  it('leaves the ground, peaks, and lands in about AIR_MS', () => {
    const start = createDino(rng());
    let s = step(start, { jump: true }, DT, rng());
    expect(s.y).toBeGreaterThan(0);
    let ms = DT;
    while (s.y > 0 && ms < 2000) {
      s = step(s, { jump: s.vy > 0 }, DT, rng());
      ms += DT;
    }
    expect(s.y).toBe(0);
    expect(Math.abs(ms - AIR_MS)).toBeLessThan(40);
  });

  it('hops lower when jump is released early', () => {
    const base = createDino(rng());
    const full = run(base, 700, (s) => s.y === 0 || s.vy > 0);
    const short = run(base, 700, (s) => s.y === 0 && !s.started);
    expect(short.peak).toBeGreaterThan(0);
    expect(short.peak).toBeLessThan(full.peak * 0.6);
  });

  it('collides with an obstacle on the ground but not over it', () => {
    const o = { id: 1, x: DINO_X + 4, w: 10, h: 14 };
    expect(hits(0, o)).toBe(true);
    expect(hits(20, o)).toBe(false);
    expect(hits(0, { ...o, x: DINO_X + DINO_W + 5 })).toBe(false);
  });

  it('ends the run on impact and then stops', () => {
    const s: DinoState = {
      ...createDino(rng()),
      started: true,
      obstacles: [{ id: 1, x: DINO_X + 2, w: 10, h: 14 }],
    };
    const hit = step(s, { jump: false }, DT, rng());
    expect(hit.over).toBe(true);
    expect(step(hit, { jump: true }, DT, rng())).toBe(hit);
  });

  it('speeds up with distance, up to a cap', () => {
    expect(speedAt(0)).toBeLessThan(speedAt(2000));
    expect(speedAt(1e9)).toBe(speedAt(1e8));
    expect(scoreOf(95)).toBe(9);
  });

  it('is always beatable: a bot that jumps just before each obstacle survives a minute', () => {
    const bot = (s: DinoState) => {
      if (s.y > 0) return s.vy > 0;
      const next = s.obstacles.find((o) => o.x + o.w > DINO_X);
      return !!next && next.x - (DINO_X + DINO_W) < s.speed * 150;
    };
    const started = step(createDino(rng()), { jump: true }, DT, rng());
    const { state } = run(started, 60_000, bot, createRng(11));
    expect(state.over).toBe(false);
    expect(state.distance).toBeGreaterThan(5000);
  });

  it('never idles into trouble: a dino that never jumps is hit by the first obstacle', () => {
    const start = step(createDino(rng()), { jump: true }, DT, rng());
    const { state } = run({ ...start, y: 0, vy: 0 }, 20_000, () => false);
    expect(state.over).toBe(true);
  });
});
