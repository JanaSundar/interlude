import { randInt, type Rng } from '../core/random';

export const HOLES = 9;
export const DURATION = 20_000;

export type Mole = { id: number; hole: number; until: number };
export type WhackState = {
  moles: Mole[];
  time: number;
  nextSpawn: number;
  nextId: number;
  score: number;
  misses: number;
  over: boolean;
};

export function createWhack(): WhackState {
  return { moles: [], time: 0, nextSpawn: 400, nextId: 1, score: 0, misses: 0, over: false };
}

/** Moles stay up for less time as the round goes on. */
const lifetime = (time: number, rng: Rng) => 1100 - (time / DURATION) * 450 + rng() * 250;

export function tick(state: WhackState, dt: number, rng: Rng): WhackState {
  if (state.over) return state;
  const time = state.time + dt;
  if (time >= DURATION) return { ...state, time: DURATION, moles: [], over: true };
  let moles = state.moles.filter((m) => m.until > time);
  let { nextSpawn, nextId } = state;
  if (time >= nextSpawn) {
    const taken = new Set(moles.map((m) => m.hole));
    const free = [...Array(HOLES).keys()].filter((h) => !taken.has(h));
    if (free.length) {
      const hole = free[randInt(rng, free.length)] as number;
      moles = [...moles, { id: nextId++, hole, until: time + lifetime(time, rng) }];
    }
    nextSpawn = time + 380 + rng() * 520;
  }
  return { ...state, time, moles, nextSpawn, nextId };
}

export function whack(state: WhackState, hole: number): { state: WhackState; hit: boolean } {
  if (state.over) return { state, hit: false };
  const mole = state.moles.find((m) => m.hole === hole);
  if (!mole) return { state: { ...state, misses: state.misses + 1 }, hit: false };
  return {
    state: { ...state, score: state.score + 1, moles: state.moles.filter((m) => m !== mole) },
    hit: true,
  };
}
