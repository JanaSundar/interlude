import { useAnimate } from 'motion/react';
import { useRef, useState } from 'react';
import { dot, useCanvas } from '../core/canvas';
import { Board, Bursts, GameOverlay, ScoreLivesHud, useBursts } from '../core/game-ui';
import { createLoader } from '../core/interlude';
import { axis, useHeldKeys, usePointerTarget } from '../core/input';
import { createRng, randomSeed } from '../core/random';
import type { GameDefinition, GameProps } from '../core/types';
import { useGameLoop } from '../core/use-game-loop';
import { useGameStatus } from '../core/use-game-status';
import { createShooter, ENEMY_R, H, SHIP_Y, step, W } from './logic';
import { shooterPattern } from './pattern';

const LEFT = ['ArrowLeft', 'a', 'A'];
const RIGHT = ['ArrowRight', 'd', 'D'];
const FIRE = [' ', 'ArrowUp', 'w', 'W'];

/** Enemy silhouette as dot offsets: a small original 5-dot drone. */
const DRONE: [number, number][] = [
  [0, 0],
  [-1, -1],
  [1, -1],
  [-1.6, 0.6],
  [1.6, 0.6],
];

export function SpaceShooterGame(props: GameProps) {
  const { paused, speed, reducedMotion } = props;
  const rng = useRef(createRng(props.seed ?? randomSeed()));
  const state = useRef(createShooter());
  const [hud, setHud] = useState({ score: 0, lives: 3, over: false });
  const { ref, begin } = useCanvas(W, H);
  const bursts = useBursts();
  const pointer = usePointerTarget(W, H);
  const [scope, animate] = useAnimate<HTMLDivElement>();

  const restart = () => {
    state.current = createShooter();
    setHud({ score: 0, lives: 3, over: false });
  };

  const held = useHeldKeys([...LEFT, ...RIGHT, ...FIRE], paused, (key) =>
    hud.over && (key === 'Enter' || key === 'r') ? (restart(), true) : false,
  );

  useGameLoop(
    {
      update: (ms) => {
        const target = pointer.target.current?.x ?? null;
        const fire = target !== null || FIRE.some((k) => held.current.has(k));
        const result = step(
          state.current,
          { dir: axis(held.current, LEFT, RIGHT), target, fire },
          ms * speed,
          rng.current,
        );
        state.current = result.state;
        for (const h of result.hits) bursts.add(h.x, h.y);
        if (result.damaged && !reducedMotion && scope.current) {
          animate(scope.current, { x: [0, -3, 3, -2, 0] }, { duration: 0.25 });
        }
        const s = result.state;
        setHud((p) =>
          p.score === s.score && p.lives === s.lives && p.over === s.over
            ? p
            : { score: s.score, lives: s.lives, over: s.over },
        );
      },
      render: () => {
        const frame = begin();
        if (!frame) return;
        const { ctx, palette } = frame;
        const s = state.current;
        ctx.fillStyle = palette.fg;
        // Slow parallax star dots.
        ctx.globalAlpha = 0.18;
        for (let i = 0; i < 24; i++) dot(ctx, (i * 53) % W, (i * 97 + s.time * 0.02) % H, 0.8);
        ctx.globalAlpha = 0.75;
        for (const e of s.enemies)
          for (const [dx, dy] of DRONE)
            dot(ctx, e.x + dx * ENEMY_R * 0.6, e.y + dy * ENEMY_R * 0.6, 1.8);
        ctx.globalAlpha = 1;
        ctx.fillStyle = palette.accent;
        for (const b of s.bullets) dot(ctx, b.x, b.y, 1.6);
        const blink = s.invulnerable > 0 && Math.floor(s.invulnerable / 100) % 2 === 0;
        ctx.globalAlpha = blink ? 0.3 : 1;
        for (const [dx, dy] of [
          [0, -5],
          [-4, 2],
          [4, 2],
          [0, 1],
        ] as const)
          dot(ctx, s.x + dx, SHIP_Y + dy, 2.4);
        ctx.globalAlpha = 1;
      },
    },
    1000 / 120,
    !paused && !hud.over,
  );

  useGameStatus(hud.over, props, `Ship lost. Score ${hud.score}.`);

  return (
    <div className="flex flex-col gap-1.5">
      <ScoreLivesHud score={hud.score} lives={hud.lives} />
      <Board
        aspect={W / H}
        className="max-w-[15rem] self-center bg-current/[0.03]"
        {...pointer.handlers}
      >
        <div ref={scope} className="size-full">
          <canvas ref={ref} className="size-full" aria-hidden />
        </div>
        <Bursts {...bursts} width={W} height={H} reduced={reducedMotion} onDone={bursts.remove} />
        <GameOverlay
          show={hud.over}
          title="Ship lost"
          detail={`score ${hud.score}`}
          action="Play again"
          onAction={restart}
          autoFocus
        />
      </Board>
    </div>
  );
}

export const spaceShooter: GameDefinition = {
  name: 'Space Shooter',
  pattern: shooterPattern,
  Game: SpaceShooterGame,
  realtime: true,
  controls: '←→ move · Space fires · drag to fly and fire',
};

export const SpaceShooterLoader = createLoader(spaceShooter);
