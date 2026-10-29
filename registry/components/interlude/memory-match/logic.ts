import { shuffle, type Rng } from '../core/random';

/** 3×3 dot glyphs as 9-bit masks (row-major, top-left is bit 0). */
export const GLYPHS = [
  0b101010101, 0b010111010, 0b111101111, 0b100010001, 0b001010100, 0b111000111,
];
export const PAIRS = GLYPHS.length;

export type Card = { id: number; glyph: number; matched: boolean };
export type MemoryState = {
  cards: Card[];
  /** Indices currently face up and unmatched (0–2). */
  flipped: number[];
  moves: number;
};

export function createMemory(rng: Rng): MemoryState {
  const glyphs = shuffle(rng, [...GLYPHS.keys(), ...GLYPHS.keys()]);
  return {
    cards: glyphs.map((glyph, id) => ({ id, glyph, matched: false })),
    flipped: [],
    moves: 0,
  };
}

export const isMismatch = (s: MemoryState) => s.flipped.length === 2;
export const isComplete = (s: MemoryState) => s.cards.every((c) => c.matched);

export function flip(state: MemoryState, index: number): MemoryState {
  const card = state.cards[index];
  if (!card || card.matched || state.flipped.includes(index) || state.flipped.length >= 2)
    return state;
  const flipped = [...state.flipped, index];
  if (flipped.length < 2) return { ...state, flipped };
  const [a, b] = flipped as [number, number];
  const moves = state.moves + 1;
  if (state.cards[a]?.glyph === state.cards[b]?.glyph) {
    const cards = state.cards.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c));
    return { cards, flipped: [], moves };
  }
  return { ...state, flipped, moves };
}

/** Turn a mismatched pair back face down. */
export const settle = (state: MemoryState): MemoryState => ({ ...state, flipped: [] });
