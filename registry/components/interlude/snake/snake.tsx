import { useRef, useState } from 'react';
import { dot, dotField, useCanvas } from '../core/canvas';
import { createLoader } from '../core/interlude';
import { Board, GameOverlay, Hud } from '../core/game-ui';
import { delta, directionFromKey, useStageKeys, useSwipe, type Direction } from '../core/input';
import { createRng, randomSeed } from '../core/random';
import type { GameDefinition, GameProps } from '../core/types';
import { useGameLoop } from '../core/use-game-loop';
import { useGameStatus } from '../core/use-game-status';
import {
  COLS,
  createSnake,
  ROWS,
  step,
  stepInterval,
  turn,
  wrapDelta,
  type Point,
  type SnakeState,
} from './logic';
import { snakePattern } from './pattern';

const CELL = 12;
const W = COLS * CELL;
const H = ROWS * CELL;

/** Pure: a cell position `t` of the way from one step to the next, going the short way round. */
const glide = (from: Point, to: Point, t: number): Point => ({
  x: from.x + wrapDelta(from.x, to.x, COLS) * t,
  y: from.y + wrapDelta(from.y, to.y, ROWS) * t,
});

/** Two eyes on the head, set toward the direction of travel. */
function eyes(ctx: CanvasRenderingContext2D, s: SnakeState, t: number) {
  const head = s.snake[0];
  if (!head) return;
  const { x, y } = glide(s.prev[0] ?? head, head, t);
  const [dx, dy] = delta[s.dir];
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  for (const side of [-1, 1]) {
    const ex = (x + 0.5 + dx * 0.16 - dy * 0.17 * side) * CELL;
    const ey = (y + 0.5 + dy * 0.16 + dx * 0.17 * side) * CELL;
    dot(ctx, ex, ey, CELL * 0.07);
  }
}

export function SnakeGame(props: GameProps) {
  const { paused, speed, seed } = props;
  const rng = useRef(createRng(seed ?? randomSeed()));
  const state = useRef(createSnake(rng.current));
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const best = useRef(0);
  const { ref, begin } = useCanvas(W, H);

  const restart = () => {
    state.current = createSnake(rng.current);
    setScore(0);
    setOver(false);
    setStarted(false);
  };

  const steer = (dir: Direction) => {
    if (state.current.over) return;
    state.current = turn(state.current, dir);
    setStarted(true);
  };

  useStageKeys(({ key, type }) => {
    if (type !== 'down') return false;
    if (over && (key === 'r' || key === 'R' || key === 'Enter')) return (restart(), true);
    const dir = directionFromKey(key);
    if (dir) steer(dir);
    return !!dir;
  });

  useGameLoop(
    {
      update: () => {
        state.current = step(state.current, rng.current);
        const s = state.current;
        best.current = Math.max(best.current, s.score);
        setScore(s.score);
        setOver(s.over);
      },
      render: (alpha) => {
        const frame = begin();
        if (!frame) return;
        const { ctx, palette } = frame;
        const s = state.current;
        dotField(ctx, COLS, ROWS, CELL, palette.fg);
        ctx.fillStyle = palette.fg;
        const pulse = 0.75 + 0.25 * Math.sin(performance.now() / 180);
        dot(ctx, (s.food.x + 0.5) * CELL, (s.food.y + 0.5) * CELL, CELL * 0.3 * pulse);
        ctx.fillStyle = palette.accent;
        const t = s.over ? 1 : alpha;
        s.snake.forEach((p, i) => {
          const from = s.prev[i] ?? p;
          // Interpolate along the short way round, so a wrap glides off one
          // edge and in from the other instead of sweeping across the board.
          const { x, y } = glide(from, p, t);
          ctx.globalAlpha = s.over ? 0.35 : 1 - (i / s.snake.length) * 0.55;
          // The body tapers from the head to the tail.
          const r = CELL * (0.46 - 0.2 * (i / Math.max(1, s.snake.length - 1)));
          for (const ox of [-COLS, 0, COLS]) {
            for (const oy of [-ROWS, 0, ROWS])
              dot(ctx, (x + ox + 0.5) * CELL, (y + oy + 0.5) * CELL, r);
          }
        });
        ctx.globalAlpha = 1;
        if (!s.over) eyes(ctx, s, t);
      },
    },
    stepInterval(score, speed),
    started && !paused && !over,
  );

  useGameStatus(over, props, `Game over. Score ${score}.`);
  const swipe = useSwipe(steer);

  return (
    <div className="flex flex-col gap-1.5">
      <Hud
        items={[
          { label: 'score', value: score },
          { label: 'best', value: Math.max(best.current, score) },
        ]}
      />
      <Board aspect={W / H} {...swipe}>
        <canvas ref={ref} className="size-full" aria-hidden />
        <GameOverlay show={!started && !over} title="Arrow keys or swipe to start" />
        <GameOverlay
          show={over}
          title={state.current.won ? 'Board cleared' : 'Game over'}
          detail={`score ${score}`}
          action="Play again"
          onAction={restart}
          autoFocus
        />
      </Board>
    </div>
  );
}

export const snake: GameDefinition = {
  name: 'Snake',
  pattern: snakePattern,
  Game: SnakeGame,
  realtime: true,
  controls: 'Arrows / WASD or swipe · walls wrap',
};

export const SnakeLoader = createLoader(snake);
