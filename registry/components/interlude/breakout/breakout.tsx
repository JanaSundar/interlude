import { useRef, useState } from 'react';
import { dot, roundRect, useCanvas } from '../core/canvas';
import { Board, Bursts, GameOverlay, ScoreLivesHud, useBursts } from '../core/game-ui';
import { createLoader } from '../core/interlude';
import { axis, useHeldKeys, usePointerTarget } from '../core/input';
import type { GameDefinition, GameProps } from '../core/types';
import { useGameLoop } from '../core/use-game-loop';
import { useGameStatus } from '../core/use-game-status';
import {
  BALL_R,
  BRICK_H,
  BRICK_W,
  createBreakout,
  H,
  PADDLE_H,
  PADDLE_W,
  PADDLE_Y,
  step,
  W,
} from './logic';
import { breakoutPattern } from './pattern';

const LEFT = ['ArrowLeft', 'a', 'A'];
const RIGHT = ['ArrowRight', 'd', 'D'];

export function BreakoutGame(props: GameProps) {
  const { paused, speed, reducedMotion } = props;
  const state = useRef(createBreakout());
  const launch = useRef(false);
  const [hud, setHud] = useState({ score: 0, lives: 3, over: false, won: false, stuck: true });
  const { ref, begin } = useCanvas(W, H);
  const bursts = useBursts();
  const pointer = usePointerTarget(W, H);

  const restart = () => {
    state.current = createBreakout();
    setHud({ score: 0, lives: 3, over: false, won: false, stuck: true });
  };

  const held = useHeldKeys([...LEFT, ...RIGHT], paused, (key) => {
    if (hud.over) return key === 'Enter' || key === 'r' ? (restart(), true) : false;
    if (key !== ' ' && key !== 'ArrowUp') return false;
    launch.current = true;
    return true;
  });

  useGameLoop(
    {
      update: (ms) => {
        const target = pointer.target.current?.x ?? null;
        // Touch: pressing the board also launches a waiting ball.
        const input = {
          dir: axis(held.current, LEFT, RIGHT),
          target,
          launch: launch.current || target !== null,
        };
        launch.current = false;
        const result = step(state.current, input, ms * speed);
        state.current = result.state;
        for (const h of result.hits) bursts.add(h.x, h.y);
        const s = result.state;
        setHud((prev) =>
          prev.score === s.score &&
          prev.lives === s.lives &&
          prev.over === s.over &&
          prev.stuck === s.stuck
            ? prev
            : { score: s.score, lives: s.lives, over: s.over, won: s.won, stuck: s.stuck },
        );
      },
      render: () => {
        const frame = begin();
        if (!frame) return;
        const { ctx, palette } = frame;
        const s = state.current;
        s.bricks.forEach((b, i) => {
          if (!b.alive) return;
          ctx.fillStyle = i < 16 ? palette.accent : palette.fg;
          ctx.globalAlpha = i < 16 ? 1 - Math.floor(i / 8) * 0.3 : 0.45;
          roundRect(ctx, b.x, b.y, BRICK_W, BRICK_H, 2);
        });
        ctx.globalAlpha = 1;
        ctx.fillStyle = palette.fg;
        roundRect(ctx, s.paddle - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H, 2);
        ctx.fillStyle = palette.accent;
        dot(ctx, s.ball.x, s.ball.y, BALL_R);
      },
    },
    1000 / 120,
    !paused && !hud.over,
  );

  useGameStatus(
    hud.over,
    props,
    hud.won ? `Cleared! Score ${hud.score}.` : `Game over. Score ${hud.score}.`,
  );

  return (
    <div className="flex flex-col gap-1.5">
      <ScoreLivesHud score={hud.score} lives={hud.lives} />
      <Board aspect={W / H} className="bg-current/[0.03]" {...pointer.handlers}>
        <canvas ref={ref} className="size-full" aria-hidden />
        <Bursts {...bursts} width={W} height={H} reduced={reducedMotion} onDone={bursts.remove} />
        {hud.stuck && !hud.over && (
          <p className="pointer-events-none absolute inset-x-0 bottom-7 text-center font-mono text-[10px] opacity-50">
            Space or tap to launch
          </p>
        )}
        <GameOverlay
          show={hud.over}
          title={hud.won ? 'All clear' : 'Out of balls'}
          detail={`score ${hud.score}`}
          action="Play again"
          onAction={restart}
          autoFocus
        />
      </Board>
    </div>
  );
}

export const breakout: GameDefinition = {
  name: 'Breakout',
  pattern: breakoutPattern,
  Game: BreakoutGame,
  realtime: true,
  controls: '←→ / A D or drag · Space launches',
};

export const BreakoutLoader = createLoader(breakout);
