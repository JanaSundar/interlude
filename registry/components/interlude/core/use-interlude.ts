import { useCallback, useEffect, useReducer } from 'react';
import {
  canDiscover,
  effectiveGame,
  gameReducer,
  viewFor,
  type GameEvent,
  type TaskStatus,
} from './lifecycle';

export type UseInterludeOptions = {
  task: TaskStatus;
  /** Controlled discovery. Leave undefined to let the user decide. */
  discovered?: boolean;
  onDiscoveredChange?: (discovered: boolean) => void;
};

export function useInterlude({ task, discovered, onDiscoveredChange }: UseInterludeOptions) {
  const [stored, dispatch] = useReducer(gameReducer, 'hidden');

  // A finished task wipes the guest, so a later run never resumes a game on its own.
  useEffect(() => {
    if (!canDiscover(task)) dispatch({ type: 'reset' });
  }, [task]);

  // Mirror controlled discovery into the reducer.
  useEffect(() => {
    if (discovered === undefined) return;
    dispatch({ type: discovered ? 'discover' : 'dismiss' });
  }, [discovered]);

  const game = effectiveGame(task, stored);

  const send = useCallback(
    (event: GameEvent) => {
      if (event.type === 'discover' && !canDiscover(task)) return;
      dispatch(event);
      if (event.type === 'discover') onDiscoveredChange?.(true);
      if (event.type === 'dismiss') onDiscoveredChange?.(false);
    },
    [task, onDiscoveredChange],
  );

  return { game, view: viewFor(task, game), send };
}
