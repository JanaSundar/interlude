import { describe, expect, it } from 'vite-plus/test';
import { ripplePattern } from '../dot-matrix-loader/pattern';
import { patternDots } from './dots';

describe('patternDots', () => {
  it('lays one dot per cell inside the box', () => {
    const dots = patternDots(ripplePattern, 300);
    expect(dots).toHaveLength(ripplePattern.cols * ripplePattern.rows);
    for (const d of dots) {
      expect(d.x).toBeGreaterThan(0);
      expect(d.x).toBeLessThan(300);
      expect(d.y).toBeGreaterThan(0);
      expect(d.y).toBeLessThan(300);
    }
  });

  it('centres a pattern that is wider than it is tall', () => {
    const wide = { cols: 6, rows: 3, period: 1, frame: () => ({ o: 1 }) };
    const ys = patternDots(wide, 300).map((d) => d.y);
    expect(Math.min(...ys) + Math.max(...ys)).toBeCloseTo(300);
  });
});
