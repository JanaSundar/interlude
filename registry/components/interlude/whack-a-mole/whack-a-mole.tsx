import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { GameOverlay, Hud } from '../core/game-ui';
import { spring } from '../primitives/motion';
import { createLoader } from '../core/interlude';
import { useStageKeys } from '../core/input';
import { createRng, randomSeed } from '../core/random';
import type { GameDefinition, GameProps } from '../core/types';
import { useGameLoop } from '../core/use-game-loop';
import { useGameStatus } from '../core/use-game-status';
import { createWhack, DURATION, HOLES, tick, whack } from './logic';
import { whackPattern } from './pattern';

export function WhackAMoleGame(props: GameProps) {
  const { paused, speed, reducedMotion } = props;
  const rng = useRef(createRng(props.seed ?? randomSeed()));
  const [state, setState] = useState(createWhack);
  const [started, setStarted] = useState(false);
  const [hits, setHits] = useState<{ id: number; hole: number }[]>([]);

  const restart = () => {
    setState(createWhack());
    setHits([]);
    setStarted(true);
  };

  const hit = (hole: number) => {
    if (!started || paused) return;
    const result = whack(state, hole);
    setState(result.state);
    if (result.hit) setHits((h) => [...h.slice(-4), { id: Date.now() + hole, hole }]);
  };

  useStageKeys(({ key, type }) => {
    if (type !== 'down') return false;
    if (!started || state.over) {
      if (key !== ' ' && key !== 'Enter') return false;
      restart();
      return true;
    }
    const n = Number(key);
    if (Number.isInteger(n) && n >= 1 && n <= 9) {
      hit(n - 1);
      return true;
    }
    return false;
  });

  useGameLoop(
    { update: (ms) => setState((s) => tick(s, ms * speed, rng.current)), render: () => {} },
    50,
    started && !paused && !state.over,
  );

  useGameStatus(state.over, props, `Time. You caught ${state.score}.`);
  const seconds = Math.ceil((DURATION - state.time) / 1000);

  return (
    <div className="flex flex-col gap-1.5">
      <Hud
        items={[
          { label: 'caught', value: state.score },
          { label: 'missed', value: state.misses },
          { label: 'time', value: `${seconds}s` },
        ]}
      />
      <div className="relative">
        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Holes, keys 1 to 9">
          {Array.from({ length: HOLES }, (_, hole) => {
            const up = state.moles.some((m) => m.hole === hole);
            return (
              <button
                key={hole}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  hit(hole);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    hit(hole);
                  }
                }}
                aria-label={`Hole ${hole + 1}${up ? ', target up' : ''}`}
                className="relative grid aspect-[5/3] cursor-pointer place-items-center overflow-hidden rounded-md border border-current/10 outline-none focus-visible:ring-2 focus-visible:ring-(--il-accent)"
              >
                <span className="absolute bottom-2 h-1 w-6 rounded-full bg-current opacity-10" />
                <AnimatePresence>
                  {up && (
                    <motion.span
                      className="size-5 rounded-full bg-(--il-accent)"
                      initial={{ y: reducedMotion ? 0 : 18, scale: 0.6, opacity: 0 }}
                      animate={{ y: 0, scale: 1, opacity: 1 }}
                      exit={{
                        y: reducedMotion ? 0 : 18,
                        scale: 0.6,
                        opacity: 0,
                        transition: { duration: 0.12 },
                      }}
                      transition={spring}
                    />
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {hits
                    .filter((h) => h.hole === hole)
                    .map((h) => (
                      <motion.span
                        key={h.id}
                        className="absolute size-6 rounded-full border-2 border-(--il-accent)"
                        initial={{ scale: 0.5, opacity: 1 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        onAnimationComplete={() =>
                          setHits((list) => list.filter((x) => x.id !== h.id))
                        }
                      />
                    ))}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
        <GameOverlay
          show={!started}
          title="20 seconds. Catch the dots."
          detail="tap, or keys 1–9"
          action="Start"
          onAction={restart}
        />
        <GameOverlay
          show={state.over}
          title="Time"
          detail={`caught ${state.score} · missed ${state.misses}`}
          action="Play again"
          onAction={restart}
          autoFocus
        />
      </div>
    </div>
  );
}

export const whackAMole: GameDefinition = {
  name: 'Whack-a-Mole',
  pattern: whackPattern,
  Game: WhackAMoleGame,
  realtime: true,
  controls: 'Tap or keys 1–9',
};

export const WhackAMoleLoader = createLoader(whackAMole);
