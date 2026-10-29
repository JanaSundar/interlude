import { motion } from 'motion/react';
import { useRef, useState, type KeyboardEvent } from 'react';
import { GameOverlay, Hud } from '../core/game-ui';
import { cx } from '../primitives/cx';
import { clamp } from '../primitives/math';
import { spring } from '../primitives/motion';
import { createLoader } from '../core/interlude';
import { createRng, randomSeed } from '../core/random';
import type { GameDefinition, GameProps } from '../core/types';
import { useTimeout } from '../core/use-game-loop';
import { useGameStatus } from '../core/use-game-status';
import { createMemory, flip, GLYPHS, isComplete, isMismatch, settle, type Card } from './logic';
import { memoryPattern } from './pattern';

const COLS = 4;

export function MemoryMatchGame(props: GameProps) {
  const rng = useRef(createRng(props.seed ?? randomSeed()));
  const [state, setState] = useState(() => createMemory(rng.current));
  const done = isComplete(state);

  useTimeout(() => setState(settle), isMismatch(state) ? 750 / props.speed : null);
  useGameStatus(done, props, `All pairs found in ${state.moves} moves.`);

  // Arrow keys move between cards; Enter/Space flip the focused one.
  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -COLS,
      ArrowDown: COLS,
    };
    const step = steps[e.key];
    if (step === undefined) return;
    const cards = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[data-card]')];
    const index = cards.indexOf(document.activeElement as HTMLButtonElement);
    const next = cards[clamp(Math.max(index, 0) + step, 0, cards.length - 1)];
    next?.focus();
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Hud
        items={[
          { label: 'moves', value: state.moves },
          { label: 'pairs', value: state.cards.filter((c) => c.matched).length / 2 },
        ]}
      />
      <div className="relative">
        <div
          role="group"
          aria-label="Cards"
          className="grid grid-cols-4 gap-1.5 [perspective:600px]"
          onKeyDown={onGridKey}
        >
          {state.cards.map((card, i) => (
            <CardView
              key={card.id}
              card={card}
              index={i}
              faceUp={card.matched || state.flipped.includes(i)}
              onFlip={() => setState((s) => flip(s, i))}
            />
          ))}
        </div>
        <GameOverlay
          show={done}
          title="All pairs found"
          detail={`${state.moves} moves`}
          action="Play again"
          onAction={() => setState(createMemory(rng.current))}
          autoFocus
        />
      </div>
    </div>
  );
}

function CardView({
  card,
  index,
  faceUp,
  onFlip,
}: {
  card: Card;
  index: number;
  faceUp: boolean;
  onFlip: () => void;
}) {
  return (
    <motion.button
      type="button"
      data-card
      onClick={onFlip}
      aria-label={
        faceUp
          ? `Card ${index + 1}, symbol ${card.glyph + 1}${card.matched ? ', matched' : ''}`
          : `Card ${index + 1}, face down`
      }
      className="relative aspect-[4/5] cursor-pointer rounded-md outline-none disabled:cursor-default [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-(--il-accent)"
      animate={{ rotateY: faceUp ? 180 : 0, scale: card.matched ? 0.94 : 1 }}
      transition={spring}
      whileTap={{ scale: 0.95 }}
    >
      <span className="absolute inset-0 grid place-items-center rounded-md border border-current/12 bg-current/[0.03] [backface-visibility:hidden]">
        <span className="size-1 rounded-full bg-current opacity-25" />
      </span>
      <span
        className={cx(
          'absolute inset-0 grid place-items-center rounded-md border [backface-visibility:hidden] [transform:rotateY(180deg)]',
          card.matched ? 'border-(--il-accent)/40 bg-(--il-accent)/10' : 'border-(--il-accent)',
        )}
      >
        <Glyph mask={GLYPHS[card.glyph] ?? 0} />
      </span>
    </motion.button>
  );
}

function Glyph({ mask }: { mask: number }) {
  return (
    <span className="grid grid-cols-3 gap-[3px]" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={cx(
            'size-1.5 rounded-full bg-(--il-accent)',
            !(mask & (1 << i)) && 'opacity-10',
          )}
        />
      ))}
    </span>
  );
}

export const memoryMatch: GameDefinition = {
  name: 'Memory Match',
  pattern: memoryPattern,
  Game: MemoryMatchGame,
  realtime: false,
  controls: 'Click or arrows + Enter to flip',
};

export const MemoryMatchLoader = createLoader(memoryMatch);
