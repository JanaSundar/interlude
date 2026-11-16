import { describe, expect, it } from 'vite-plus/test';
import { KOLAM_MARGIN, kolamStrands, strandSpan } from './kolam';

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

describe('kolam', () => {
  it.each([
    [2, 2],
    [2, 3],
    [3, 3],
    [3, 4],
    [4, 4],
    [4, 6],
  ])('draws a %i×%i grid in as many loops as its sides share', (cols, rows) => {
    expect(kolamStrands(cols, rows)).toHaveLength(gcd(cols, rows));
  });

  it('passes every crossing exactly twice', () => {
    for (const [cols, rows] of [
      [3, 3],
      [3, 4],
      [5, 2],
    ] as const) {
      const crossings = (cols - 1) * rows + cols * (rows - 1);
      const passes = kolamStrands(cols, rows).reduce((n, s) => n + s.crossings, 0);
      expect(passes).toBe(crossings * 2);
    }
  });

  it('closes every loop and stays inside its margin', () => {
    for (const { d } of kolamStrands(3, 3)) {
      expect(d.startsWith('M')).toBe(true);
      expect(d.endsWith('Z')).toBe(true);
      // Control points overshoot the curve, so they bound it loosely.
      for (const n of d.match(/-?\d+(\.\d+)?/g)!.map(Number)) {
        expect(n).toBeGreaterThanOrEqual(-1);
        expect(n).toBeLessThanOrEqual(3);
      }
    }
    expect(KOLAM_MARGIN).toBeLessThan(1);
  });

  it('draws each loop from empty to whole, then lifts it again', () => {
    expect(strandSpan(0, 0)).toEqual({ from: 0, to: 0 });
    expect(strandSpan(0.5, 2)).toEqual({ from: 0, to: 1 });
    const end = strandSpan(0.999, 2);
    expect(end.to - end.from).toBeCloseTo(0);
  });

  it('never draws backwards and starts later loops later', () => {
    for (let p = 0; p < 1; p += 0.01) {
      for (let i = 0; i < 3; i++) {
        const { from, to } = strandSpan(p, i);
        expect(to).toBeGreaterThanOrEqual(from);
      }
      expect(strandSpan(p, 0).to).toBeGreaterThanOrEqual(strandSpan(p, 1).to);
    }
  });
});
