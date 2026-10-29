import { useEffect, useRef } from 'react';

/**
 * Runs `effect` whenever an action control's counter actually changes.
 * Compares against the last seen value rather than skipping a "first run",
 * so StrictMode's double-invoked effects can't fire it on mount.
 */
export function useOnBump(counter: unknown, effect: () => void) {
  const seen = useRef(counter);
  const latest = useRef(effect);
  latest.current = effect;
  useEffect(() => {
    if (Object.is(seen.current, counter)) return;
    seen.current = counter;
    latest.current();
  }, [counter]);
}
