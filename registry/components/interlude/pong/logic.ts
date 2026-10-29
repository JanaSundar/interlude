import { clamp } from '../primitives/math';
import type { Rng } from '../core/random';

export const W = 240;
export const H = 150;
export const PADDLE_H = 30;
export const PADDLE_W = 4;
export const BALL_R = 3;
export const PLAYER_X = 10;
export const AI_X = W - 10 - PADDLE_W;
export const WIN_SCORE = 5;

const BALL_SPEED = 0.15;
const MAX_SPEED = 0.34;
const PLAYER_SPEED = 0.3;
const AI_SPEED = 0.16;
const SERVE_DELAY = 700;

export type Ball = { x: number; y: number; vx: number; vy: number };
export type PongState = {
  ball: Ball;
  player: number;
  ai: number;
  score: { player: number; ai: number };
  serveIn: number;
  over: boolean;
};
export type PongInput = { dir: -1 | 0 | 1; target: number | null };
export type Impact = { x: number; y: number };

function serve(towards: 1 | -1, rng: Rng): Ball {
  const angle = (rng() - 0.5) * 0.9;
  return {
    x: W / 2,
    y: H / 2,
    vx: Math.cos(angle) * BALL_SPEED * towards,
    vy: Math.sin(angle) * BALL_SPEED,
  };
}

export function createPong(rng: Rng): PongState {
  return {
    ball: serve(rng() > 0.5 ? 1 : -1, rng),
    player: H / 2,
    ai: H / 2,
    score: { player: 0, ai: 0 },
    serveIn: SERVE_DELAY,
    over: false,
  };
}

const halfH = PADDLE_H / 2;
const clampPaddle = (y: number) => clamp(y, halfH, H - halfH);

function approach(current: number, target: number, maxStep: number) {
  return current + clamp(target - current, -maxStep, maxStep);
}

/** Bounce off a paddle; where it hits decides the outgoing angle. */
function hitPaddle(ball: Ball, paddleY: number, dirOut: 1 | -1): Ball {
  const offset = (ball.y - paddleY) / halfH;
  const speed = Math.min(MAX_SPEED, Math.hypot(ball.vx, ball.vy) * 1.06);
  const angle = offset * 0.85;
  return { ...ball, vx: Math.cos(angle) * speed * dirOut, vy: Math.sin(angle) * speed };
}

export function step(
  state: PongState,
  input: PongInput,
  dt: number,
  rng: Rng,
): { state: PongState; impacts: Impact[] } {
  if (state.over) return { state, impacts: [] };
  const impacts: Impact[] = [];
  const player = clampPaddle(
    input.target !== null
      ? approach(state.player, input.target, PLAYER_SPEED * 1.4 * dt)
      : state.player + input.dir * PLAYER_SPEED * dt,
  );
  // The AI only tracks the ball while it's coming its way, and not perfectly.
  const aiTarget = state.ball.vx > 0 ? state.ball.y : H / 2;
  const ai = clampPaddle(approach(state.ai, aiTarget, AI_SPEED * dt));

  if (state.serveIn > 0) {
    return { state: { ...state, player, ai, serveIn: state.serveIn - dt }, impacts };
  }

  let ball = {
    ...state.ball,
    x: state.ball.x + state.ball.vx * dt,
    y: state.ball.y + state.ball.vy * dt,
  };
  if (ball.y < BALL_R || ball.y > H - BALL_R) {
    ball = { ...ball, y: clamp(ball.y, BALL_R, H - BALL_R), vy: -ball.vy };
  }
  const reachesPlayer =
    ball.vx < 0 && ball.x - BALL_R <= PLAYER_X + PADDLE_W && ball.x > PLAYER_X - BALL_R;
  if (reachesPlayer && Math.abs(ball.y - player) <= halfH + BALL_R) {
    ball = { ...hitPaddle(ball, player, 1), x: PLAYER_X + PADDLE_W + BALL_R };
    impacts.push({ x: ball.x, y: ball.y });
  }
  const reachesAi = ball.vx > 0 && ball.x + BALL_R >= AI_X && ball.x < AI_X + PADDLE_W + BALL_R;
  if (reachesAi && Math.abs(ball.y - ai) <= halfH + BALL_R) {
    ball = { ...hitPaddle(ball, ai, -1), x: AI_X - BALL_R };
    impacts.push({ x: ball.x, y: ball.y });
  }

  if (ball.x < -BALL_R || ball.x > W + BALL_R) {
    const playerScored = ball.x > W;
    const score = {
      player: state.score.player + (playerScored ? 1 : 0),
      ai: state.score.ai + (playerScored ? 0 : 1),
    };
    const over = score.player >= WIN_SCORE || score.ai >= WIN_SCORE;
    return {
      state: {
        ball: serve(playerScored ? -1 : 1, rng),
        player,
        ai,
        score,
        serveIn: SERVE_DELAY,
        over,
      },
      impacts,
    };
  }
  return { state: { ...state, ball, player, ai }, impacts };
}
