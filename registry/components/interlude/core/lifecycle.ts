/**
 * Task lifecycle and game state are kept apart on purpose: the task is owned
 * by the host app and is always authoritative, the game is a guest that only
 * exists while the task is loading.
 */
import { isSettled, resolveTask, statusLabel, type TaskStatus } from '../primitives/status';

export { resolveTask, type TaskStatus };
export type GameStatus = 'hidden' | 'playing' | 'paused' | 'over';

export type GameEvent =
  | { type: 'discover' }
  | { type: 'dismiss' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'over' }
  | { type: 'restart' }
  | { type: 'reset' };

export const isTerminal = (task: TaskStatus): boolean => isSettled(task);

export function canDiscover(task: TaskStatus): boolean {
  return task === 'loading';
}

/** Pure transition for the guest game. Restarting never touches the task. */
export function gameReducer(game: GameStatus, event: GameEvent): GameStatus {
  switch (event.type) {
    case 'discover':
      return game === 'hidden' ? 'playing' : game;
    case 'dismiss':
    case 'reset':
      return 'hidden';
    case 'pause':
      return game === 'playing' ? 'paused' : game;
    case 'resume':
      return game === 'paused' ? 'playing' : game;
    case 'over':
      return game === 'hidden' ? game : 'over';
    case 'restart':
      return game === 'hidden' ? game : 'playing';
  }
}

/** The game is only ever visible while the task is still loading. */
export function effectiveGame(task: TaskStatus, game: GameStatus): GameStatus {
  return canDiscover(task) ? game : 'hidden';
}

export type View = 'none' | 'loader' | 'game' | 'result';

export function viewFor(task: TaskStatus, game: GameStatus): View {
  if (isTerminal(task)) return 'result';
  if (task === 'idle') return 'none';
  return effectiveGame(task, game) === 'hidden' ? 'loader' : 'game';
}

export function taskMessage(task: TaskStatus, label?: string): string {
  if (task === 'idle') return '';
  return task === 'loading' && label ? label : statusLabel(task);
}
