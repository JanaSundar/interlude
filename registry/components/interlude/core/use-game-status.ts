import { useEffect, useRef } from 'react';
import type { GameProps } from './types';

/**
 * Reports play / game-over transitions to the shell and announces the end
 * state for screen readers. Skips the initial mount.
 */
export function useGameStatus(
  over: boolean,
  props: Pick<GameProps, 'onStatusChange' | 'announce'>,
  overMessage: string,
) {
  const latest = useRef({ props, overMessage });
  latest.current = { props, overMessage };
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const { props: p, overMessage: msg } = latest.current;
    p.onStatusChange(over ? 'over' : 'playing');
    if (over) p.announce(msg);
  }, [over]);
}
