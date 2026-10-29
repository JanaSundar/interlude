import { describe, expect, it } from 'vite-plus/test';
import { createRng } from '../core/random';
import { createMemory, flip, isComplete, isMismatch, PAIRS, settle } from './logic';

const pairOf = (glyphs: number[], glyph: number) =>
  glyphs.flatMap((g, i) => (g === glyph ? [i] : []));

describe('memory match', () => {
  const s = createMemory(createRng(5));
  const glyphs = s.cards.map((c) => c.glyph);

  it('deals every glyph exactly twice', () => {
    expect(s.cards).toHaveLength(PAIRS * 2);
    for (let g = 0; g < PAIRS; g++) expect(pairOf(glyphs, g)).toHaveLength(2);
  });

  it('matches a pair and counts the move', () => {
    const [a, b] = pairOf(glyphs, 0) as [number, number];
    const next = flip(flip(s, a), b);
    expect(next.cards[a]!.matched && next.cards[b]!.matched).toBe(true);
    expect(next.flipped).toEqual([]);
    expect(next.moves).toBe(1);
  });

  it('holds a mismatch until settled and blocks a third flip', () => {
    const a = pairOf(glyphs, 0)[0]!;
    const b = pairOf(glyphs, 1)[0]!;
    const c = pairOf(glyphs, 2)[0]!;
    const open = flip(flip(s, a), b);
    expect(isMismatch(open)).toBe(true);
    expect(flip(open, c)).toBe(open);
    expect(settle(open).flipped).toEqual([]);
  });

  it('ignores flipping the same card twice', () => {
    const one = flip(s, 0);
    expect(flip(one, 0)).toBe(one);
  });

  it('completes when all pairs are found', () => {
    let state = s;
    for (let g = 0; g < PAIRS; g++) {
      const [a, b] = pairOf(glyphs, g) as [number, number];
      state = flip(flip(state, a), b);
    }
    expect(isComplete(state)).toBe(true);
    expect(state.moves).toBe(PAIRS);
  });
});
