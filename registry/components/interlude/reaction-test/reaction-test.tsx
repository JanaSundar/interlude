import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Hud } from '../core/game-ui';
import { spring } from '../primitives/motion';
import { createLoader } from '../core/interlude';
import { useStageKeys } from '../core/input';
import { createRng, randomSeed } from '../core/random';
import type { GameDefinition, GameProps } from '../core/types';
import { useTimeout } from '../core/use-game-loop';
import {
  average,
  best,
  createReaction,
  interrupt,
  press,
  signal,
  type ReactionPhase,
} from './logic';
import { reactionPattern } from './pattern';

const copy: Record<ReactionPhase['kind'], string> = {
  idle: 'Press to start',
  waiting: 'Wait for blue…',
  go: 'Now!',
  result: 'Again?',
  early: 'Too soon. Press to retry',
};

export function ReactionTestGame({ paused, seed, announce }: GameProps) {
  const rng = useRef(createRng(seed ?? randomSeed()));
  const [state, setState] = useState(createReaction);
  const { phase } = state;

  useEffect(() => {
    if (paused) setState(interrupt);
  }, [paused]);

  useTimeout(
    () => setState((s) => signal(s, performance.now())),
    phase.kind === 'waiting' && !paused ? phase.delay : null,
  );

  useEffect(() => {
    if (phase.kind === 'result') announce(`${phase.ms} milliseconds`);
    if (phase.kind === 'early') announce('False start');
    if (phase.kind === 'go') announce('Now');
  }, [phase, announce]);

  const act = () => setState((s) => press(s, performance.now(), rng.current));
  useStageKeys(({ key, type }) => {
    if (type !== 'down' || (key !== ' ' && key !== 'Enter')) return false;
    act();
    return true;
  });

  const go = phase.kind === 'go';
  return (
    <div className="flex flex-col gap-1.5">
      <Hud
        items={[
          { label: 'best', value: fmt(best(state.results)) },
          { label: 'avg', value: fmt(average(state.results)) },
        ]}
      />
      <motion.button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          act();
        }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            act();
          }
        }}
        aria-label={copy[phase.kind]}
        className="relative grid aspect-[16/9] w-full touch-none place-items-center overflow-hidden rounded-md border border-current/10 outline-none select-none focus-visible:ring-2 focus-visible:ring-(--il-accent)"
        animate={{
          backgroundColor: go ? 'var(--il-accent)' : 'rgba(127,127,127,0.04)',
          color: go ? '#fff' : 'currentColor',
        }}
        transition={{ duration: go ? 0 : 0.2 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={phase.kind === 'result' ? `r${phase.ms}` : phase.kind}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ ...spring, opacity: { duration: 0.1 } }}
          >
            {phase.kind === 'result' && (
              <span className="font-mono text-2xl font-medium tabular-nums">{phase.ms} ms</span>
            )}
            {phase.kind === 'waiting' && <WaitingDots />}
            <span className={phase.kind === 'result' ? 'text-[11px] opacity-60' : 'text-sm'}>
              {copy[phase.kind]}
            </span>
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

const fmt = (ms: number | null) => (ms === null ? '–' : `${ms}ms`);

function WaitingDots() {
  return (
    <span className="flex gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-current"
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}

export const reactionTest: GameDefinition = {
  name: 'Reaction Test',
  pattern: reactionPattern,
  Game: ReactionTestGame,
  realtime: true,
  controls: 'Click, tap, Space or Enter',
};

export const ReactionTestLoader = createLoader(reactionTest);
