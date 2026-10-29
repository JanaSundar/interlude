import { describe, expect, it } from 'vite-plus/test';
import { createRng } from '../core/random';
import { createWhack, DURATION, tick, whack } from './logic';

describe('whack-a-mole', () => {
  it('spawns targets over time in distinct holes', () => {
    const rng = createRng(2);
    let s = createWhack();
    for (let t = 0; t < 3000; t += 50) s = tick(s, 50, rng);
    expect(s.nextId).toBeGreaterThan(2);
    const holes = s.moles.map((m) => m.hole);
    expect(new Set(holes).size).toBe(holes.length);
  });

  it('scores hits and counts misses', () => {
    const s = { ...createWhack(), moles: [{ id: 1, hole: 4, until: 9999 }] };
    const hit = whack(s, 4);
    expect(hit.hit).toBe(true);
    expect(hit.state.score).toBe(1);
    expect(hit.state.moles).toHaveLength(0);
    const miss = whack(s, 0);
    expect(miss.hit).toBe(false);
    expect(miss.state.misses).toBe(1);
  });

  it('expires targets and ends the round on time', () => {
    const rng = createRng(2);
    const s = { ...createWhack(), moles: [{ id: 1, hole: 4, until: 100 }], nextSpawn: 99999 };
    expect(tick(s, 150, rng).moles).toHaveLength(0);
    const end = tick({ ...s, time: DURATION - 10 }, 20, rng);
    expect(end.over).toBe(true);
    expect(whack(end, 4).state).toBe(end);
  });
});
