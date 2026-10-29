import { clamp } from '../primitives/math';

export const W = 240;
export const H = 180;
export const BRICK_COLS = 8;
export const BRICK_ROWS = 4;
export const PADDLE_W = 40;
export const PADDLE_H = 4;
export const PADDLE_Y = H - 14;
export const BALL_R = 3;
const MARGIN = 8;
const GAP = 4;
const TOP = 18;
export const BRICK_W = (W - MARGIN * 2 - GAP * (BRICK_COLS - 1)) / BRICK_COLS;
export const BRICK_H = 7;
const SPEED = 0.17;
const PADDLE_SPEED = 0.32;

export type Brick = { x: number; y: number; alive: boolean };
export type BreakoutState = {
  bricks: Brick[];
  paddle: number;
  ball: { x: number; y: number; vx: number; vy: number };
  stuck: boolean;
  lives: number;
  score: number;
  over: boolean;
  won: boolean;
};
export type BreakoutInput = { dir: -1 | 0 | 1; target: number | null; launch: boolean };

export function createBreakout(): BreakoutState {
  const bricks: Brick[] = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({ x: MARGIN + c * (BRICK_W + GAP), y: TOP + r * (BRICK_H + GAP), alive: true });
    }
  }
  return {
    bricks,
    paddle: W / 2,
    ball: { x: W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 },
    stuck: true,
    lives: 3,
    score: 0,
    over: false,
    won: false,
  };
}

/** Circle vs rectangle; returns which axis to reflect, or null. */
export function collideRect(
  ball: { x: number; y: number },
  rect: { x: number; y: number; w: number; h: number },
): 'x' | 'y' | null {
  const nx = clamp(ball.x, rect.x, rect.x + rect.w);
  const ny = clamp(ball.y, rect.y, rect.y + rect.h);
  const dx = ball.x - nx;
  const dy = ball.y - ny;
  if (dx * dx + dy * dy > BALL_R * BALL_R) return null;
  return Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
}

export function step(
  state: BreakoutState,
  input: BreakoutInput,
  dt: number,
): { state: BreakoutState; hits: { x: number; y: number }[] } {
  if (state.over) return { state, hits: [] };
  const half = PADDLE_W / 2;
  const desired = input.target ?? state.paddle + input.dir * PADDLE_SPEED * dt;
  const paddle = clamp(
    state.paddle + clamp(desired - state.paddle, -PADDLE_SPEED * 1.6 * dt, PADDLE_SPEED * 1.6 * dt),
    half,
    W - half,
  );

  if (state.stuck) {
    const ball = { x: paddle, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 };
    if (input.launch) {
      ball.vx = SPEED * 0.45;
      ball.vy = -SPEED;
    }
    return { state: { ...state, paddle, ball, stuck: !input.launch }, hits: [] };
  }

  let { x, y, vx, vy } = state.ball;
  x += vx * dt;
  y += vy * dt;
  if (x < BALL_R || x > W - BALL_R) {
    vx = -vx;
    x = clamp(x, BALL_R, W - BALL_R);
  }
  if (y < BALL_R) {
    vy = Math.abs(vy);
    y = BALL_R;
  }

  // Paddle: the hit position steers the ball.
  if (
    vy > 0 &&
    collideRect({ x, y }, { x: paddle - half, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H })
  ) {
    const offset = clamp((x - paddle) / half, -1, 1);
    const speed = Math.min(Math.hypot(vx, vy) * 1.02, SPEED * 1.8);
    vx = speed * Math.sin(offset * 1.05);
    vy = -speed * Math.cos(offset * 1.05);
    y = PADDLE_Y - BALL_R;
  }

  const hits: { x: number; y: number }[] = [];
  let bricks = state.bricks;
  let score = state.score;
  const index = bricks.findIndex(
    (b) => b.alive && collideRect({ x, y }, { x: b.x, y: b.y, w: BRICK_W, h: BRICK_H }),
  );
  if (index !== -1) {
    const brick = bricks[index] as Brick;
    const axisHit = collideRect({ x, y }, { x: brick.x, y: brick.y, w: BRICK_W, h: BRICK_H });
    if (axisHit === 'x') vx = -vx;
    else vy = -vy;
    bricks = bricks.map((b, i) => (i === index ? { ...b, alive: false } : b));
    score += 10;
    hits.push({ x: brick.x + BRICK_W / 2, y: brick.y + BRICK_H / 2 });
  }

  const won = bricks.every((b) => !b.alive);
  if (y > H + BALL_R) {
    const lives = state.lives - 1;
    return {
      state: {
        ...state,
        bricks,
        paddle,
        score,
        lives,
        stuck: true,
        over: lives <= 0,
        ball: { x: paddle, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 },
      },
      hits,
    };
  }
  return {
    state: { ...state, bricks, paddle, score, ball: { x, y, vx, vy }, over: won, won },
    hits,
  };
}
