import { useRef, useState } from 'react';
import { dot, roundRect, useCanvas } from '../core/canvas';
import { Board, GameOverlay, Hud } from '../core/game-ui';
import { useHeldKeys, usePointerTarget } from '../core/input';
import { createLoader } from '../core/interlude';
import { useHudState } from '../core/use-hud-state';
import { createRng, randomSeed } from '../core/random';
import type { GameDefinition, GameProps } from '../core/types';
import { useGameLoop } from '../core/use-game-loop';
import { useGameStatus } from '../core/use-game-status';
import { createDino, DINO_H, DINO_X, GROUND, H, scoreOf, step, W, type DinoState } from './logic';
import { dinoPattern } from './pattern';

const JUMP = [' ', 'ArrowUp', 'w', 'W'];

/** Where the clouds start: x and y in board units, and width. */
const CLOUDS = [
  { x: 30, y: 30, w: 26 },
  { x: 130, y: 52, w: 20 },
  { x: 200, y: 22, w: 30 },
];

/** How long, in ms of running, each pair of legs takes to swap. */
const STRIDE_MS = 90;

/**
 * Draws the dino in a box DINO_W × DINO_H whose feet are at `feet`. Pure
 * rectangles (body, head, tail, legs) keep it crisp at any size, and the
 * legs alternate while it's on the ground.
 */
function drawDino(ctx: CanvasRenderingContext2D, feet: number, running: boolean, clock: number) {
  const x = DINO_X;
  const top = feet - DINO_H;
  const stepLeft = running && Math.floor(clock / STRIDE_MS) % 2 === 0;
  roundRect(ctx, x + 1, top + 5, 9, 7, 2); // body
  roundRect(ctx, x + 6, top, 8, 6, 2); // head
  roundRect(ctx, x, top + 6, 4, 3, 1.5); // tail
  roundRect(ctx, x + 2, top + 11, 3, stepLeft ? 3 : 5, 1); // back leg
  roundRect(ctx, x + 7, top + 11, 3, stepLeft ? 5 : 3, 1); // front leg
  // The eye is a hole through the head, so it takes the board's own colour.
  ctx.globalCompositeOperation = 'destination-out';
  roundRect(ctx, x + 11, top + 1.5, 1.6, 1.6, 0.6);
  ctx.globalCompositeOperation = 'source-over';
}

export function DinoRunGame(props: GameProps) {
  const { paused, speed, seed } = props;
  const rng = useRef(createRng(seed ?? randomSeed()));
  const state = useRef<DinoState>(createDino(rng.current));
  const clock = useRef(0);
  /** A press shorter than one simulation step still counts as a jump. */
  const queued = useRef(false);
  const [hud, setHud] = useHudState({ score: 0, over: false, started: false });
  const [best, setBest] = useState(0);
  const { ref, paint } = useCanvas(W, H);
  const pointer = usePointerTarget(W, H, () => {
    queued.current = true;
  });

  const restart = () => {
    state.current = createDino(rng.current);
    clock.current = 0;
    setHud({ score: 0, over: false, started: false });
  };

  const held = useHeldKeys(JUMP, paused, (key) => {
    if (hud.over && (key === 'Enter' || key === 'r')) return (restart(), true);
    if (JUMP.includes(key)) queued.current = true;
    return false;
  });

  useGameLoop(
    {
      update: (ms) => {
        const jump =
          queued.current ||
          JUMP.some((k) => held.current.has(k)) ||
          pointer.target.current !== null;
        queued.current = false;
        state.current = step(state.current, { jump }, ms * speed, rng.current);
        clock.current += ms * speed;
        const s = state.current;
        const score = scoreOf(s.distance);
        setHud({ score, over: s.over, started: s.started });
        if (s.over) setBest((b) => Math.max(b, score));
      },
      render: () =>
        paint((ctx, palette) => {
          const s = state.current;

          // Clouds drift slower than the ground, which gives the board some depth.
          ctx.fillStyle = palette.fg;
          ctx.globalAlpha = 0.12;
          CLOUDS.forEach(({ x, y, w }) => {
            const cx = ((((x - s.distance * 0.15) % (W + 60)) + W + 60) % (W + 60)) - 30;
            roundRect(ctx, cx, y, w, 4, 2);
            roundRect(ctx, cx + w * 0.25, y - 3, w * 0.5, 4, 2);
          });

          // Ground: a dotted line that scrolls with the world.
          ctx.fillStyle = palette.fg;
          ctx.globalAlpha = 0.35;
          const offset = s.distance % 8;
          for (let gx = -offset; gx < W; gx += 8) dot(ctx, gx + 4, GROUND + 3, 0.7);

          // Cacti: a trunk with two arms, sized by each obstacle.
          ctx.globalAlpha = 0.75;
          for (const o of s.obstacles) {
            roundRect(ctx, o.x, GROUND - o.h, o.w, o.h, Math.min(3, o.w / 2));
            if (o.w >= 10) {
              roundRect(ctx, o.x - 2, GROUND - o.h * 0.7, 3, o.h * 0.3, 1.2);
              roundRect(ctx, o.x + o.w - 1, GROUND - o.h * 0.85, 3, o.h * 0.3, 1.2);
            }
          }

          // The dino: accent-coloured, legs still while airborne.
          ctx.globalAlpha = 1;
          ctx.fillStyle = palette.accent;
          drawDino(ctx, GROUND - s.y, s.started && !s.over && s.y === 0, clock.current);
        }),
    },
    1000 / 120,
    !paused && !hud.over,
  );

  useGameStatus(hud.over, props, `Tripped. Score ${hud.score}.`);

  return (
    <div className="flex flex-col gap-1.5">
      <Hud
        items={[
          { label: 'score', value: hud.score },
          { label: 'best', value: Math.max(best, hud.over ? hud.score : 0) },
        ]}
      />
      <Board aspect={W / H} className="bg-current/[0.03]" {...pointer.handlers}>
        <canvas ref={ref} className="size-full" aria-hidden />
        {!hud.started && !hud.over && (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center font-mono text-[10px] opacity-50">
            Space or tap to jump
          </p>
        )}
        <GameOverlay
          show={hud.over}
          title="Tripped"
          detail={`Score ${hud.score}`}
          action="Run again"
          onAction={restart}
          autoFocus
        />
      </Board>
    </div>
  );
}

export const dinoRun: GameDefinition = {
  name: 'Dino Run',
  pattern: dinoPattern,
  Game: DinoRunGame,
  realtime: true,
  controls: 'Space / ↑ / tap to jump · release early for a short hop',
};

export const DinoRunLoader = createLoader(dinoRun);
