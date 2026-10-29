import { describe, expect, it } from 'vite-plus/test';
import { createRng } from '../core/random';
import { createShooter, enemySpeed, H, SHIP_Y, step, W } from './logic';

const idle = { dir: 0 as const, target: null, fire: false };

describe('space shooter', () => {
  it('fires with a cooldown', () => {
    const rng = createRng(1);
    const once = step(createShooter(), { ...idle, fire: true }, 16, rng).state;
    expect(once.bullets).toHaveLength(1);
    const again = step(once, { ...idle, fire: true }, 16, rng).state;
    expect(again.bullets).toHaveLength(1);
  });

  it('destroys an enemy a bullet touches and scores', () => {
    const s = {
      ...createShooter(),
      spawnIn: 1e9,
      bullets: [{ x: 50, y: 52 }],
      enemies: [{ id: 1, x: 50, y: 50, phase: 0 }],
    };
    const { state, hits } = step(s, idle, 1, createRng(1));
    expect(state.enemies).toHaveLength(0);
    expect(state.bullets).toHaveLength(0);
    expect(state.score).toBe(10);
    expect(hits).toHaveLength(1);
  });

  it('loses a life on contact, then is briefly invulnerable', () => {
    const s = {
      ...createShooter(),
      spawnIn: 1e9,
      enemies: [
        { id: 1, x: W / 2, y: SHIP_Y, phase: 0 },
        { id: 2, x: W / 2, y: SHIP_Y - 2, phase: 0 },
      ],
    };
    const { state, damaged } = step(s, idle, 1, createRng(1));
    expect(damaged).toBe(true);
    expect(state.lives).toBe(2);
    expect(state.invulnerable).toBeGreaterThan(0);
  });

  it('loses a life when an enemy slips past', () => {
    const s = {
      ...createShooter(),
      spawnIn: 1e9,
      x: 10,
      enemies: [{ id: 1, x: W - 10, y: H + 20, phase: 0 }],
    };
    expect(step(s, idle, 1, createRng(1)).state.lives).toBe(2);
  });

  it('ends at zero lives and gets faster over time', () => {
    const s = {
      ...createShooter(),
      lives: 1,
      spawnIn: 1e9,
      enemies: [{ id: 1, x: W / 2, y: SHIP_Y, phase: 0 }],
    };
    expect(step(s, idle, 1, createRng(1)).state.over).toBe(true);
    expect(enemySpeed(60_000)).toBeGreaterThan(enemySpeed(0));
  });
});
