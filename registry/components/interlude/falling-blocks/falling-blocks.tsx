import { AnimatePresence, motion, useAnimate } from 'motion/react';
import { useRef, useState } from 'react';
import { dotField, roundRect, useCanvas } from '../core/canvas';
import { Board, GameOverlay, Hud } from '../core/game-ui';
import { createLoader } from '../core/interlude';
import { useStageKeys, useSwipe } from '../core/input';
import { createRng, randomSeed } from '../core/random';
import type { GameDefinition, GameProps } from '../core/types';
import { useGameLoop } from '../core/use-game-loop';
import { useGameStatus } from '../core/use-game-status';
import {
  COLS,
  createBlocks,
  fall,
  gravityInterval,
  hardDrop,
  move,
  pieceCells,
  rotate,
  ROWS,
  type BlocksState,
} from './logic';
import { fallingBlocksPattern } from './pattern';

const CELL = 10;
const W = COLS * CELL;
const H = ROWS * CELL;

export function FallingBlocksGame(props: GameProps) {
  const { paused, speed, seed, reducedMotion } = props;
  const rng = useRef(createRng(seed ?? randomSeed()));
  const state = useRef(createBlocks(rng.current));
  const [hud, setHud] = useState(() => snapshot(state.current));
  const { ref, begin } = useCanvas(W, H);
  const [scope, animate] = useAnimate<HTMLDivElement>();

  const apply = (next: BlocksState) => {
    state.current = next;
    setHud((prev) => {
      const snap = snapshot(next);
      return JSON.stringify(prev) === JSON.stringify(snap) ? prev : snap;
    });
  };

  const restart = () => apply(createBlocks(rng.current));
  const drop = () => {
    apply(hardDrop(state.current, rng.current));
    if (!reducedMotion && scope.current)
      animate(scope.current, { y: [0, 2, 0] }, { duration: 0.16 });
  };

  useStageKeys(({ key, type }) => {
    if (type !== 'down') return false;
    const s = state.current;
    if (s.over) return key === 'Enter' || key === 'r' ? (restart(), true) : false;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => apply(move(s, -1)),
      ArrowRight: () => apply(move(s, 1)),
      ArrowDown: () => apply(fall(s, rng.current)),
      ArrowUp: () => apply(rotate(s)),
      x: () => apply(rotate(s)),
      ' ': drop,
    };
    const action = actions[key];
    action?.();
    return !!action;
  });

  useGameLoop(
    {
      update: () => apply(fall(state.current, rng.current)),
      render: () => {
        const frame = begin();
        if (!frame) return;
        const { ctx, palette } = frame;
        const s = state.current;
        dotField(ctx, COLS, ROWS, CELL, palette.fg);
        ctx.fillStyle = palette.fg;
        s.board.forEach((c, i) => {
          if (!c) return;
          ctx.globalAlpha = 0.55;
          roundRect(
            ctx,
            (i % COLS) * CELL + 1,
            Math.floor(i / COLS) * CELL + 1,
            CELL - 2,
            CELL - 2,
            2,
          );
        });
        ctx.globalAlpha = 1;
        ctx.fillStyle = palette.accent;
        for (const [x, y] of pieceCells(s.piece)) {
          if (y >= 0) roundRect(ctx, x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2, 2);
        }
      },
    },
    gravityInterval(hud.lines, speed),
    !paused && !hud.over,
  );

  useGameStatus(hud.over, props, `Game over. Score ${hud.score}, ${hud.lines} lines.`);
  const swipe = useSwipe(
    (dir) => {
      if (dir === 'left') apply(move(state.current, -1));
      else if (dir === 'right') apply(move(state.current, 1));
      else if (dir === 'down') drop();
      else apply(rotate(state.current));
    },
    () => apply(rotate(state.current)),
  );

  return (
    <div className="flex gap-3">
      <Board aspect={W / H} className="max-w-[9.5rem]" {...swipe}>
        <div ref={scope} className="size-full">
          <canvas ref={ref} className="size-full" aria-hidden />
        </div>
        <AnimatePresence>
          {state.current.cleared.map((row) => (
            <motion.span
              key={`${hud.clears}-${row}`}
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bg-(--il-accent)"
              style={{ top: `${(row / ROWS) * 100}%`, height: `${100 / ROWS}%` }}
              initial={{ opacity: 0.9, scaleX: 1 }}
              animate={{ opacity: 0, scaleX: reducedMotion ? 1 : 0.2 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
        <GameOverlay
          show={hud.over}
          title="Stacked out"
          detail={`score ${hud.score}`}
          action="Play again"
          onAction={restart}
          autoFocus
        />
      </Board>
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] opacity-50">next</span>
          <NextPiece kind={hud.next} />
        </div>
        <div className="flex flex-col gap-1">
          <Hud items={[{ label: 'score', value: hud.score }]} />
          <Hud items={[{ label: 'lines', value: hud.lines }]} />
        </div>
      </div>
    </div>
  );
}

function snapshot(s: BlocksState) {
  return { score: s.score, lines: s.lines, over: s.over, next: s.next, clears: s.clears };
}

function NextPiece({ kind }: { kind: number }) {
  const cells = pieceCells({ kind, rot: 0, x: 0, y: 0 });
  return (
    <motion.div
      key={kind}
      className="relative size-10"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      aria-label="Next piece"
      role="img"
    >
      {cells.map(([x, y]) => (
        <span
          key={`${x}-${y}`}
          className="absolute size-2 rounded-[2px] bg-(--il-accent) opacity-80"
          style={{ left: x * 10, top: y * 10 + 4 }}
        />
      ))}
    </motion.div>
  );
}

export const fallingBlocks: GameDefinition = {
  name: 'Falling Blocks',
  pattern: fallingBlocksPattern,
  Game: FallingBlocksGame,
  realtime: true,
  controls: '←→ move · ↑ rotate · Space drop · tap / swipe',
};

export const FallingBlocksLoader = createLoader(fallingBlocks);
