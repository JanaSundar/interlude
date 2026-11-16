import { describe, expect, it } from 'vite-plus/test';
import { petalAngle, petalFrame, petalOpen, PETALS } from './petals';

describe('floral petals', () => {
  it('spreads the petals evenly around the centre', () => {
    expect(petalAngle(0)).toBe(0);
    expect(petalAngle(PETALS)).toBe(360);
    expect(petalAngle(1) - petalAngle(0)).toBe(360 / PETALS);
  });

  it('starts and ends every cycle folded, and is fully open in between', () => {
    for (let i = 0; i < PETALS; i++) {
      expect(petalOpen(0, i)).toBe(0);
      expect(petalOpen(0.47, i)).toBe(1);
      expect(petalOpen(0.999, i)).toBeCloseTo(0);
    }
  });

  it('opens and folds the petals in order', () => {
    for (let p = 0; p < 0.5; p += 0.01)
      for (let i = 1; i < PETALS; i++)
        expect(petalOpen(p, i)).toBeLessThanOrEqual(petalOpen(p, i - 1));
    for (let p = 0.5; p < 1; p += 0.01)
      for (let i = 1; i < PETALS; i++)
        expect(petalOpen(p, i)).toBeGreaterThanOrEqual(petalOpen(p, i - 1));
  });

  it('keeps a folded petal visible as a bud', () => {
    expect(petalFrame(0).scale).toBeGreaterThan(0);
    expect(petalFrame(0).opacity).toBeGreaterThan(0);
    expect(petalFrame(1)).toEqual({ scale: 1, opacity: 1 });
  });
});
