import { motion, useTime, useTransform, type MotionValue, type Variants } from 'motion/react';

/** One dot's state at a point in the cycle. Offsets are in cell units. */
export type DotFrame = { o: number; s?: number; x?: number; y?: number };

export type DotPattern = {
  cols: number;
  rows: number;
  /** Seconds per cycle at speed 1. */
  period: number;
  /** Pure: phase in [0, 1) plus the dot's grid position. */
  frame: (phase: number, col: number, row: number) => DotFrame;
};

export type DotMatrixProps = {
  pattern: DotPattern;
  /** Rendered width in px; height follows the pattern's aspect. */
  size?: number;
  speed?: number;
  reduced?: boolean;
  layoutId?: string;
  className?: string;
};

const matrixVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.12, transition: { type: 'spring', stiffness: 420, damping: 18 } },
};

/** Dots are drawn in cell units: 1 unit per cell, so any size stays a crisp vector. */
const DOT_R = 0.29;
const dotFill = { fill: 'var(--il-accent, var(--interlude-accent, currentColor))' };

export function DotMatrix({
  pattern,
  size = 20,
  speed = 1,
  reduced = false,
  layoutId,
  className,
}: DotMatrixProps) {
  const cells = Array.from({ length: pattern.cols * pattern.rows }, (_, i) => ({
    col: i % pattern.cols,
    row: Math.floor(i / pattern.cols),
  }));
  return (
    // Layout projection (layoutId morphs) only works on HTML elements, so the
    // shared id and hover scale live on a wrapper, not on the SVG itself.
    <motion.span
      aria-hidden
      layoutId={layoutId}
      variants={matrixVariants}
      className={`inline-grid shrink-0 ${className ?? ''}`}
    >
      <motion.svg
        viewBox={`0 0 ${pattern.cols} ${pattern.rows}`}
        width={size}
        height={(size * pattern.rows) / pattern.cols}
        shapeRendering="geometricPrecision"
        className="overflow-visible"
      >
        {reduced ? (
          <StaticDots pattern={pattern} cells={cells} />
        ) : (
          <AnimatedDots pattern={pattern} cells={cells} speed={speed} />
        )}
      </motion.svg>
    </motion.span>
  );
}

type DotsProps = {
  pattern: DotPattern;
  cells: { col: number; row: number }[];
};

function AnimatedDots({ pattern, cells, speed }: DotsProps & { speed: number }) {
  // One clock per matrix; every dot derives from it without React re-renders.
  const time = useTime();
  const phase = useTransform(time, (ms) => (((ms / 1000) * speed) / pattern.period) % 1);
  return cells.map(({ col, row }) => (
    <Dot key={`${col}-${row}`} phase={phase} pattern={pattern} col={col} row={row} />
  ));
}

function Dot({
  phase,
  pattern,
  col,
  row,
}: {
  phase: MotionValue<number>;
  pattern: DotPattern;
  col: number;
  row: number;
}) {
  const frame = useTransform(phase, (p) => pattern.frame(p, col, row));
  const opacity = useTransform(frame, (f) => f.o);
  const scale = useTransform(frame, (f) => f.s ?? 1);
  // CSS transforms on SVG elements are in user units, i.e. cells here.
  const x = useTransform(frame, (f) => f.x ?? 0);
  const y = useTransform(frame, (f) => f.y ?? 0);
  return (
    <motion.circle
      cx={col + 0.5}
      cy={row + 0.5}
      r={DOT_R}
      style={{
        ...dotFill,
        opacity,
        scale,
        x,
        y,
        transformBox: 'fill-box',
        originX: 0.5,
        originY: 0.5,
      }}
    />
  );
}

function StaticDots({ pattern, cells }: DotsProps) {
  return cells.map(({ col, row }) => {
    const f = pattern.frame(0.3, col, row);
    return (
      <circle
        key={`${col}-${row}`}
        cx={col + 0.5}
        cy={row + 0.5}
        r={DOT_R * (f.s ?? 1)}
        style={{ ...dotFill, opacity: Math.max(f.o, 0.12) }}
      />
    );
  });
}
