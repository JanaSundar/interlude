import { describe, expect, it } from 'vite-plus/test';
import {
  BALL_R,
  BRICK_H,
  BRICK_W,
  collideRect,
  createBreakout,
  H,
  PADDLE_Y,
  step,
  W,
} from './logic';

const idle = { dir: 0 as const, target: null, launch: false };

describe('breakout', () => {
  it('keeps the ball on the paddle until launched', () => {
    const s = createBreakout();
    const moved = step(s, { ...idle, dir: 1 }, 50).state;
    expect(moved.stuck).toBe(true);
    expect(moved.ball.x).toBe(moved.paddle);
    const launched = step(s, { ...idle, launch: true }, 16).state;
    expect(launched.stuck).toBe(false);
    expect(launched.ball.vy).toBeLessThan(0);
  });

  it('breaks a brick and reflects', () => {
    const s = createBreakout();
    const brick = s.bricks[20]!;
    const ball = { x: brick.x + BRICK_W / 2, y: brick.y + BRICK_H + BALL_R + 0.5, vx: 0, vy: -0.2 };
    const { state, hits } = step({ ...s, stuck: false, ball }, idle, 16);
    expect(state.bricks.filter((b) => !b.alive)).toHaveLength(1);
    expect(state.score).toBe(10);
    expect(state.ball.vy).toBeGreaterThan(0);
    expect(hits).toHaveLength(1);
  });

  it('loses a life when the ball drops, and ends at zero', () => {
    const s = { ...createBreakout(), stuck: false, ball: { x: 10, y: H + 1, vx: 0, vy: 0.2 } };
    const once = step(s, idle, 16).state;
    expect(once.lives).toBe(2);
    expect(once.stuck).toBe(true);
    const last = step({ ...s, lives: 1 }, idle, 16).state;
    expect(last.over).toBe(true);
    expect(last.won).toBe(false);
  });

  it('wins when the last brick goes', () => {
    const s = createBreakout();
    const bricks = s.bricks.map((b, i) => ({ ...b, alive: i === 0 }));
    const b = bricks[0]!;
    const ball = { x: b.x + BRICK_W / 2, y: b.y + BRICK_H + BALL_R - 0.5, vx: 0, vy: -0.2 };
    const next = step({ ...s, bricks, stuck: false, ball }, idle, 1).state;
    expect(next.won).toBe(true);
    expect(next.over).toBe(true);
  });

  it('steers the ball by where it hits the paddle', () => {
    const s = createBreakout();
    const right = { x: s.paddle + 15, y: PADDLE_Y - BALL_R + 1, vx: 0, vy: 0.2 };
    expect(step({ ...s, stuck: false, ball: right }, idle, 1).state.ball.vx).toBeGreaterThan(0);
  });

  it('detects circle-rectangle overlap', () => {
    expect(collideRect({ x: 5, y: 5 }, { x: 0, y: 0, w: 10, h: 10 })).not.toBeNull();
    expect(collideRect({ x: W, y: 5 }, { x: 0, y: 0, w: 10, h: 10 })).toBeNull();
  });
});
