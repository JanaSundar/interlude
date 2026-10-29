import { useCallback, useState } from 'react';

/** Pure: do two flat records hold the same values? */
export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => Object.is(a[k], b[k]));
}

/**
 * State for a game's readouts (score, lives, over). A game steps many times a
 * second, so `update` keeps the previous object whenever nothing changed and
 * React only re-renders when a value really did.
 */
export function useHudState<T extends Record<string, unknown>>(initial: T) {
  const [hud, set] = useState(initial);
  const update = useCallback(
    (next: T) => set((prev) => (shallowEqual(prev, next) ? prev : next)),
    [],
  );
  return [hud, update] as const;
}
