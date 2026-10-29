import { describe, expect, it } from 'vite-plus/test';
import { createRng } from '../core/random';
import {
  BALL_R,
  createPong,
  H,
  PADDLE_W,
  PLAYER_X,
  step,
  W,
  WIN_SCORE,
  type PongState,
} from './logic';

const rng = () => createRng(3);
const still = { dir: 0 as const, target: null };
const live = (s: PongState): PongState => ({ ...s, serveIn: 0 });

describe('pong', () => {
  it('waits before serving', () => {
    const s = createPong(rng());
    expect(step(s, still, 100, rng()).state.ball).toEqual(s.ball);
  });

  it('bounces off the player paddle and speeds up', () => {
    const s = live({
      ...createPong(rng()),
      player: H / 2,
      ball: { x: PLAYER_X + PADDLE_W + BALL_R + 1, y: H / 2, vx: -0.15, vy: 0 },
    });
    const { state, impacts } = step(s, still, 16, rng());
    expect(state.ball.vx).toBeGreaterThan(0);
    expect(Math.abs(state.ball.vx)).toBeGreaterThan(0.15 * 0.99);
    expect(impacts).toHaveLength(1);
  });

  it('bounces off top and bottom walls', () => {
    const s = live({
      ...createPong(rng()),
      ball: { x: W / 2, y: BALL_R + 0.5, vx: 0.1, vy: -0.2 },
    });
    expect(step(s, still, 16, rng()).state.ball.vy).toBeGreaterThan(0);
  });

  it('scores for the CPU when the ball passes the player', () => {
    const s = live({
      ...createPong(rng()),
      player: H - 20,
      ball: { x: 2, y: 10, vx: -0.3, vy: 0 },
    });
    const next = step(s, still, 30, rng()).state;
    expect(next.score).toEqual({ player: 0, ai: 1 });
    expect(next.serveIn).toBeGreaterThan(0);
  });

  it('ends at the winning score', () => {
    const s = live({
      ...createPong(rng()),
      score: { player: WIN_SCORE - 1, ai: 0 },
      ai: 10,
      ball: { x: W - 1, y: H - 10, vx: 0.3, vy: 0 },
    });
    expect(step(s, still, 30, rng()).state.over).toBe(true);
  });

  it('keeps the paddle inside the court', () => {
    const s = createPong(rng());
    const up = step(s, { dir: -1, target: null }, 5000, rng()).state;
    expect(up.player).toBeGreaterThanOrEqual(15);
  });
});
