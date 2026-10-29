import { describe, expect, it } from 'vite-plus/test';
import { delayedSeconds, ORBITS, orbitPoint } from './orbits';

describe('orbits', () => {
  it('gets more solid towards the outer orbits', () => {
    const opacities = ORBITS.map((o) => o.opacity);
    expect(opacities.at(-1)).toBe(1);
    expect([...opacities].sort((a, b) => a - b)).toEqual(opacities);
    expect(new Set(opacities).size).toBe(opacities.length);
  });

  it('holds each satellite back by its index times the stagger', () => {
    expect(delayedSeconds(2, 0, 0.3)).toBe(2);
    expect(delayedSeconds(2, 2, 0.3)).toBeCloseTo(1.4);
    expect(delayedSeconds(2, 2, 0)).toBe(2);
  });

  it('puts a delayed satellite where the earlier clock would have', () => {
    const orbit = ORBITS[1]!;
    const late = orbitPoint(orbit, delayedSeconds(1, 1, 0.25));
    const early = orbitPoint(orbit, 0.75);
    expect(late.x).toBeCloseTo(early.x);
    expect(late.y).toBeCloseTo(early.y);
  });
});
