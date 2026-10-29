import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, type ComponentProps, type ReactNode } from 'react';
import { spring } from '@registry/components/interlude/primitives/motion';
import type { Cell } from './dot-text';

export const CELL = 24;

/** Resting radius and opacity for a cell. */
const look = ({ tone, weight }: Cell) =>
  tone === 'off' ? { r: 1.6, o: 0.25 } : { r: 5.5 * weight, o: 0.85 };

/** A dot that eases to its cell's look whenever the cell changes. */
function Dot({ x, y, cell }: { x: number; y: number; cell: Cell }) {
  const target = look(cell);
  const r = useMotionValue(target.r);
  const opacity = useMotionValue(target.o);
  useEffect(() => {
    const moves = [animate(r, target.r, spring), animate(opacity, target.o, spring)];
    return () => moves.forEach((m) => m.stop());
  }, [r, opacity, target.r, target.o]);
  return (
    <motion.circle
      cx={(x + 0.5) * CELL}
      cy={(y + 0.5) * CELL}
      style={{ r, opacity }}
      fill={cell.tone === 'accent' ? 'var(--accent)' : 'var(--fg)'}
    />
  );
}

/**
 * A grid of dots. `cells` is row-major, so the same grid can show text one
 * moment and a game the next, each dot easing between its looks.
 */
export function DotGrid({
  cols,
  rows,
  cells,
  label,
  children,
  ...handlers
}: {
  cols: number;
  rows: number;
  cells: readonly Cell[];
  label: string;
  /** Extra SVG, e.g. an invisible hit area. */
  children?: ReactNode;
} & Omit<ComponentProps<typeof motion.svg>, 'children'>) {
  const reduced = !!useReducedMotion();
  return (
    <motion.svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${cols * CELL} ${rows * CELL}`}
      className="w-full max-w-xl touch-none overflow-visible"
      initial={reduced ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      {...handlers}
    >
      {cells.map((cell, i) => (
        <Dot key={i} x={i % cols} y={Math.floor(i / cols)} cell={cell} />
      ))}
      {children}
    </motion.svg>
  );
}
