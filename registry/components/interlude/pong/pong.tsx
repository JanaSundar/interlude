import { useRef, useState } from 'react';
import { dot, roundRect, useCanvas } from '../core/canvas';
import { Board, Bursts, GameOverlay, Hud, useBursts } from '../core/game-ui';
import { createLoader } from '../core/interlude';
import { axis, useHeldKeys, usePointerTarget } from '../core/input';
import { createRng, randomSeed } from '../core/random';
import type { GameDefinition, GameProps } from '../core/types';
import { useGameLoop } from '../core/use-game-loop';
import { useGameStatus } from '../core/use-game-status';
import {
  AI_X,
  BALL_R,
  createPong,
  H,
  PADDLE_H,
  PADDLE_W,
  PLAYER_X,
  step,
  W,
  WIN_SCORE,
} from './logic';
import { pongPattern } from './pattern';

const UP = ['ArrowUp', 'w', 'W'];
const DOWN = ['ArrowDown', 's', 'S'];

export function PongGame(props: GameProps) {
  const { paused, speed, seed, reducedMotion } = props;
  const rng = useRef(createRng(seed ?? randomSeed()));
  const state = useRef(createPong(rng.current));
  const [score, setScore] = useState(state.current.score);
  const [over, setOver] = useState(false);
  const { ref, paint } = useCanvas(W, H);
  const bursts = useBursts();
  const pointer = usePointerTarget(W, H);

  const restart = () => {
    state.current = createPong(rng.current);
    setScore(state.current.score);
    setOver(false);
  };

  const held = useHeldKeys([...UP, ...DOWN], paused, (key) =>
    over && (key === 'Enter' || key === 'r') ? (restart(), true) : false,
  );

  useGameLoop(
    {
      update: (ms) => {
        const target = pointer.target.current?.y ?? null;
        const result = step(
          state.current,
          { dir: axis(held.current, UP, DOWN), target },
          ms * speed,
          rng.current,
        );
        state.current = result.state;
        for (const p of result.impacts) bursts.add(p.x, p.y);
        setScore(result.state.score);
        setOver(result.state.over);
      },
      render: () =>
        paint((ctx, palette) => {
          const s = state.current;
          ctx.fillStyle = palette.fg;
          ctx.globalAlpha = 0.15;
          for (let y = 4; y < H; y += 8) dot(ctx, W / 2, y, 1);
          ctx.globalAlpha = 0.5;
          roundRect(ctx, AI_X, s.ai - PADDLE_H / 2, PADDLE_W, PADDLE_H, 2);
          ctx.globalAlpha = 1;
          ctx.fillStyle = palette.accent;
          roundRect(ctx, PLAYER_X, s.player - PADDLE_H / 2, PADDLE_W, PADDLE_H, 2);
          if (s.serveIn <= 0 || Math.floor(s.serveIn / 120) % 2 === 0) {
            dot(ctx, s.ball.x, s.ball.y, BALL_R);
          }
        }),
    },
    1000 / 120,
    !paused && !over,
  );

  const won = score.player >= WIN_SCORE;
  useGameStatus(over, props, `${won ? 'You win' : 'You lose'}, ${score.player} to ${score.ai}.`);

  return (
    <div className="flex flex-col gap-1.5">
      <Hud
        items={[
          { label: 'you', value: score.player },
          { label: 'cpu', value: score.ai },
        ]}
      />
      <Board aspect={W / H} className="bg-current/[0.03]" {...pointer.handlers}>
        <canvas ref={ref} className="size-full" aria-hidden />
        <Bursts {...bursts} width={W} height={H} reduced={reducedMotion} onDone={bursts.remove} />
        <GameOverlay
          show={over}
          title={won ? 'You win' : 'Good rally'}
          detail={`${score.player} – ${score.ai}`}
          action="Play again"
          onAction={restart}
          autoFocus
        />
      </Board>
    </div>
  );
}

export const pong: GameDefinition = {
  name: 'Pong',
  pattern: pongPattern,
  Game: PongGame,
  realtime: true,
  controls: '↑↓ / W S or drag · first to 5',
};

export const PongLoader = createLoader(pong);
