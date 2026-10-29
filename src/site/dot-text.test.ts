import { describe, expect, it } from 'vite-plus/test';
import { dotText } from './dot-text';

describe('dotText', () => {
  it('lays three glyphs out with a blank column between them', () => {
    const { cols, rows, dots } = dotText('404');
    expect(cols).toBe(17);
    expect(rows).toBe(7);
    expect(dots).toHaveLength(3 * 5 * 7);
    expect(Math.max(...dots.map((d) => d.x))).toBe(16);
  });

  it('lights the same dots for the same digit', () => {
    const { dots } = dotText('404');
    const lit = (g: number) => dots.filter((d) => d.glyph === g && d.lit).length;
    expect(lit(0)).toBe(lit(2));
    expect(lit(1)).toBeGreaterThan(0);
  });

  it('rejects characters without a glyph', () => {
    expect(() => dotText('4x')).toThrow();
  });
});
