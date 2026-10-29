import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { Board, GameOverlay, Hud } from '../core/game-ui';
import { cx } from '../primitives/cx';
import { spring } from '../primitives/motion';
import { createLoader } from '../core/interlude';
import { directionFromKey, useStageKeys, useSwipe, type Direction } from '../core/input';
import { createRng, randomSeed } from '../core/random';
import type { GameDefinition, GameProps } from '../core/types';
import { useGameStatus } from '../core/use-game-status';
import { createMerge, GOAL, move, SIZE, type Tile } from './logic';
import { mergePattern } from './pattern';

export function Merge2048Game(props: GameProps) {
  const rng = useRef(createRng(props.seed ?? randomSeed()));
  const [state, setState] = useState(() => createMerge(rng.current));
  const [keepGoing, setKeepGoing] = useState(false);

  const restart = () => {
    setState(createMerge(rng.current));
    setKeepGoing(false);
  };
  const go = (dir: Direction) => {
    if (state.won && !keepGoing) return;
    setState((s) => move(s, dir, rng.current));
  };

  useStageKeys(({ key, type }) => {
    if (type !== 'down') return false;
    if (state.over && (key === 'Enter' || key === 'r')) return (restart(), true);
    const dir = directionFromKey(key);
    if (dir) go(dir);
    return !!dir;
  });
  const swipe = useSwipe(go);
  const best = Math.max(...state.tiles.map((t) => t.value));
  useGameStatus(state.over, props, `No moves left. Score ${state.score}, best tile ${best}.`);

  return (
    <div className="flex flex-col gap-1.5">
      <Hud
        items={[
          { label: 'score', value: state.score },
          { label: 'best tile', value: best },
        ]}
      />
      <Board aspect={1} className="max-w-[15rem] self-center" {...swipe}>
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4" aria-hidden>
          {Array.from({ length: SIZE * SIZE }, (_, i) => (
            <span key={i} className="grid place-items-center">
              <span className="size-1 rounded-full bg-current opacity-15" />
            </span>
          ))}
        </div>
        <AnimatePresence>
          {state.tiles.map((tile) => (
            <TileView key={tile.id} tile={tile} reduced={props.reducedMotion} />
          ))}
        </AnimatePresence>
        <GameOverlay
          show={state.won && !keepGoing && !state.over}
          title={`${GOAL}!`}
          detail="you made it"
          action="Keep going"
          onAction={() => setKeepGoing(true)}
          autoFocus
        />
        <GameOverlay
          show={state.over}
          title="No moves left"
          detail={`score ${state.score}`}
          action="Play again"
          onAction={restart}
          autoFocus
        />
      </Board>
    </div>
  );
}

function TileView({ tile, reduced }: { tile: Tile; reduced: boolean }) {
  const level = Math.log2(tile.value);
  return (
    <motion.div
      className={cx('absolute top-0 left-0 size-1/4 p-1', tile.consumed ? 'z-0' : 'z-[1]')}
      initial={{
        x: `${tile.col * 100}%`,
        y: `${tile.row * 100}%`,
        scale: reduced ? 1 : 0.4,
        opacity: 0,
      }}
      animate={{
        x: `${tile.col * 100}%`,
        y: `${tile.row * 100}%`,
        scale: tile.merged && !reduced ? [1, 1.12, 1] : 1,
        opacity: tile.consumed ? 0 : 1,
      }}
      exit={{ opacity: 0 }}
      transition={{
        ...spring,
        opacity: { duration: 0.15, delay: tile.consumed ? 0.08 : tile.fresh ? 0.08 : 0 },
        scale: { duration: 0.22, delay: tile.fresh ? 0.08 : 0 },
      }}
    >
      <div
        className={cx(
          'grid size-full place-items-center rounded-md font-mono text-sm font-medium tabular-nums',
          level <= 2 ? 'border border-current/15' : 'bg-(--il-accent) text-white',
        )}
        style={level > 2 ? { opacity: Math.min(1, 0.35 + (level - 2) * 0.08) } : undefined}
      >
        {tile.value}
      </div>
    </motion.div>
  );
}

export const merge2048: GameDefinition = {
  name: '2048',
  pattern: mergePattern,
  Game: Merge2048Game,
  realtime: false,
  controls: 'Arrows / WASD or swipe',
};

export const Merge2048Loader = createLoader(merge2048);
