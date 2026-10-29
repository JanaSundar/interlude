import { describe, expect, it } from 'vite-plus/test';
import { typed } from './use-secret';

describe('typed', () => {
  const feed = (keys: string[], word: string) => keys.reduce((b, k) => typed(b, k, word), '');

  it('matches the word once its letters arrive in order', () => {
    expect(feed('snake'.split(''), 'snake')).toBe('snake');
  });

  it('forgets older keys, so a stray letter does not break the match', () => {
    expect(feed('xxsnake'.split(''), 'snake')).toBe('snake');
  });

  it('ignores keys that are not single characters', () => {
    expect(feed(['s', 'n', 'Shift', 'a', 'k', 'e'], 'snake')).toBe('snake');
  });

  it('is case-insensitive', () => {
    expect(feed('SNAKE'.split(''), 'snake')).toBe('snake');
  });
});
