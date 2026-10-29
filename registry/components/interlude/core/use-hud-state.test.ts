import { describe, expect, it } from 'vite-plus/test';
import { shallowEqual } from './use-hud-state';

describe('shallowEqual', () => {
  it('is true for equal flat records and false when a value or key differs', () => {
    expect(shallowEqual({ a: 1, b: false }, { a: 1, b: false })).toBe(true);
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallowEqual({ a: 1 } as Record<string, unknown>, { a: 1, b: 2 })).toBe(false);
  });
});
