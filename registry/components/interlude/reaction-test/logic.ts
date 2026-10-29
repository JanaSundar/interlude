import type { Rng } from '../core/random';

export type ReactionPhase =
  | { kind: 'idle' }
  | { kind: 'waiting'; delay: number }
  | { kind: 'go'; shownAt: number }
  | { kind: 'result'; ms: number }
  | { kind: 'early' };

export type ReactionState = { phase: ReactionPhase; results: number[] };

export const createReaction = (): ReactionState => ({ phase: { kind: 'idle' }, results: [] });

/** Random wait so the signal can't be anticipated. */
export const randomDelay = (rng: Rng) => 1200 + rng() * 2600;

/** One button does everything: start, react, or try again. */
export function press(state: ReactionState, now: number, rng: Rng): ReactionState {
  const { phase } = state;
  switch (phase.kind) {
    case 'waiting':
      return { ...state, phase: { kind: 'early' } };
    case 'go': {
      const ms = Math.max(0, Math.round(now - phase.shownAt));
      return { phase: { kind: 'result', ms }, results: [...state.results, ms].slice(-5) };
    }
    default:
      return { ...state, phase: { kind: 'waiting', delay: randomDelay(rng) } };
  }
}

export function signal(state: ReactionState, now: number): ReactionState {
  return state.phase.kind === 'waiting' ? { ...state, phase: { kind: 'go', shownAt: now } } : state;
}

/** Losing focus mid-round voids the attempt rather than timing it unfairly. */
export const interrupt = (state: ReactionState): ReactionState =>
  state.phase.kind === 'waiting' || state.phase.kind === 'go'
    ? { ...state, phase: { kind: 'idle' } }
    : state;

export const best = (results: number[]) => (results.length ? Math.min(...results) : null);
export const average = (results: number[]) =>
  results.length ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : null;
