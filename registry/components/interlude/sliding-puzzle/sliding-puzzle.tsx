import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import { Board, GameOverlay, Hud } from '../core/game-ui';
import { cx } from '../primitives/cx';
import { spring } from '../primitives/motion';
import { createLoader } from '../core/interlude';
import { directionFromKey, useStageKeys } from '../core/input';
import { createRng, randomSeed } from '../core/random';
import type { GameDefinition, GameProps } from '../core/types';
import { useGameStatus } from '../core/use-game-status';
import { createSliding, isSolved, N, slideDirection, slideTile } from './logic';
import { slidingPattern } from './pattern';

export function SlidingPuzzleGame(props: GameProps) {
  const rng = useRef(createRng(props.seed ?? randomSeed()));
  const [state, setState] = useState(() => createSliding(rng.current));
  const solved = isSolved(state.tiles);

  useStageKeys(({ key, type }) => {
    if (type !== 'down') return false;
    if (solved && (key === 'Enter' || key === 'r'))
      return (setState(createSliding(rng.current)), true);
    const dir = directionFromKey(key);
    if (dir && !solved) setState((s) => slideDirection(s, dir));
    return !!dir;
  });
  useGameStatus(solved, props, `Solved in ${state.moves} moves.`);

  return (
    <div className="flex flex-col gap-1.5">
      <Hud items={[{ label: 'moves', value: state.moves }]} />
      <Board aspect={1} className="max-w-[13rem] self-center">
        <div
          className="grid size-full grid-cols-3 grid-rows-3 gap-1.5 p-0.5"
          role="group"
          aria-label="Puzzle tiles"
        >
          {state.tiles.map((tile, index) =>
            tile === 0 ? (
              <motion.span key="gap" layout className="grid place-items-center" aria-hidden>
                <span className="size-1 rounded-full bg-current opacity-20" />
              </motion.span>
            ) : (
              <motion.button
                key={tile}
                layout
                type="button"
                transition={spring}
                disabled={solved}
                onClick={() => setState((s) => slideTile(s, index))}
                aria-label={`Tile ${tile}, row ${Math.floor(index / N) + 1}, column ${(index % N) + 1}`}
                className={cx(
                  'grid cursor-pointer place-items-center rounded-md border font-mono text-base tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-(--il-accent)',
                  tile === index + 1
                    ? 'border-(--il-accent)/50 text-(--il-accent)'
                    : 'border-current/15',
                )}
                animate={solved ? { scale: [1, 1.06, 1] } : undefined}
              >
                {tile}
              </motion.button>
            ),
          )}
        </div>
        <GameOverlay
          show={solved}
          title="Solved"
          detail={`${state.moves} moves`}
          action="Shuffle again"
          onAction={() => setState(createSliding(rng.current))}
          autoFocus
        />
      </Board>
    </div>
  );
}

export const slidingPuzzle: GameDefinition = {
  name: 'Sliding Puzzle',
  pattern: slidingPattern,
  Game: SlidingPuzzleGame,
  realtime: false,
  controls: 'Click a tile or use arrows',
};

export const SlidingPuzzleLoader = createLoader(slidingPuzzle);
