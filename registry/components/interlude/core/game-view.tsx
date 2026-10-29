import { motion, useIsPresent } from 'motion/react';
import { useEffect, useRef, type KeyboardEvent, type Ref } from 'react';
import { DotMatrix } from '../primitives/dot-matrix';
import { softSpring } from '../primitives/motion';
import { Pressable } from '../primitives/pressable';
import { GameOverlay } from './game-ui';
import { StageKeysContext, type KeyHandler } from './input';
import type { GameEvent, GameStatus } from './lifecycle';
import type { GameDefinition } from './types';

export function GameView({
  layoutId,
  definition,
  label,
  game,
  send,
  speed,
  reduced,
  seed,
  announce,
  autoFocus,
  ref,
}: {
  /** AnimatePresence's popLayout mode needs the root node to measure and remove it. */
  ref?: Ref<HTMLDivElement>;
  layoutId: string;
  definition: GameDefinition;
  label?: string;
  game: GameStatus;
  send: (event: GameEvent) => void;
  speed: number;
  reduced: boolean;
  seed?: number;
  announce: (message: string) => void;
  /** True when the user opened it from the loader; programmatic opens don't steal focus. */
  autoFocus: boolean;
}) {
  const { Game, name, pattern, realtime, controls } = definition;
  // While exiting (task finished or dismissed) the game is frozen immediately.
  const isPresent = useIsPresent();
  const stageRef = useRef<HTMLDivElement>(null);
  const keys = useRef<KeyHandler | null>(null);
  const paused = !isPresent || game === 'paused';

  useEffect(() => {
    if (autoFocus) stageRef.current?.focus({ preventScroll: true });
    else if (realtime) send({ type: 'pause' });
    // Mount-only: decided by how the game was opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resume = () => {
    send({ type: 'resume' });
    stageRef.current?.focus({ preventScroll: true });
  };

  const onKey = (type: 'down' | 'up') => (e: KeyboardEvent) => {
    if (e.key === 'Escape' && type === 'down') {
      e.preventDefault();
      send({ type: 'dismiss' });
      return;
    }
    // Let focused buttons (restart, close) handle their own keys.
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('button')) return;
    if (realtime && type === 'down' && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      if (game === 'paused') resume();
      else send({ type: 'pause' });
      return;
    }
    if (paused) return;
    if (keys.current?.({ key: e.key, type })) e.preventDefault();
  };

  return (
    <motion.div
      ref={ref}
      layout
      className="flex w-full flex-col gap-2.5 rounded-[16px] border border-current/10 bg-(--il-panel) p-3 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_10px_30px_-14px_rgb(0_0_0/0.25)]"
      initial={
        reduced ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0% 62% 86% 0% round 10px)' }
      }
      animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 10px)' }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={softSpring}
    >
      <div className="flex items-center gap-2">
        <DotMatrix
          layoutId={layoutId}
          pattern={pattern}
          size={14}
          speed={speed}
          reduced={reduced}
        />
        <span className="min-w-0 flex-1 truncate text-xs opacity-60">{label ?? 'Working'}</span>
        {realtime && (
          <IconButton
            label={game === 'paused' ? 'Resume game' : 'Pause game'}
            onClick={() => (game === 'paused' ? resume() : send({ type: 'pause' }))}
            path={game === 'paused' ? 'M5 3.5v9l7-4.5z' : 'M5 3.5h2v9H5zM9 3.5h2v9H9z'}
          />
        )}
        <IconButton
          label="Close game"
          onClick={() => send({ type: 'dismiss' })}
          path="M4.5 4.5l7 7M11.5 4.5l-7 7"
          stroke
        />
      </div>
      <motion.div
        ref={stageRef}
        data-il-stage
        tabIndex={0}
        role="group"
        aria-roledescription="game"
        aria-label={`${name}. ${controls}. Escape closes the game.`}
        inert={!isPresent}
        onKeyDown={onKey('down')}
        onKeyUp={onKey('up')}
        onBlur={(e) => {
          if (realtime && game === 'playing' && !e.currentTarget.contains(e.relatedTarget)) {
            send({ type: 'pause' });
          }
        }}
        initial={reduced ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...softSpring, delay: reduced ? 0 : 0.06 }}
        className="relative rounded-[12px] bg-current/[0.025] p-2 outline-none"
      >
        <StageKeysContext.Provider value={keys}>
          <Game
            paused={paused}
            speed={speed}
            reducedMotion={reduced}
            seed={seed}
            announce={announce}
            onStatusChange={(s) => send({ type: s === 'over' ? 'over' : 'restart' })}
          />
        </StageKeysContext.Provider>
        <GameOverlay show={game === 'paused'} title="Paused" action="Resume" onAction={resume} />
      </motion.div>
      <p className="text-center font-mono text-[10px] opacity-45">{controls} · Esc to close</p>
    </motion.div>
  );
}

function IconButton({
  label,
  onClick,
  path,
  stroke = false,
}: {
  label: string;
  onClick: () => void;
  path: string;
  stroke?: boolean;
}) {
  return (
    <Pressable
      aria-label={label}
      title={label}
      onClick={onClick}
      dim
      pressScale={0.9}
      className="grid size-6 place-items-center rounded"
    >
      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
        <path
          d={path}
          fill={stroke ? 'none' : 'currentColor'}
          stroke={stroke ? 'currentColor' : 'none'}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </svg>
    </Pressable>
  );
}
