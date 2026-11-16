import { motion, useTransform, type MotionValue } from 'motion/react';
import { LoaderFrame, type StatusLoaderProps } from '../primitives/loader-frame';
import { useLoop } from '../primitives/loop';
import { clampSpeed } from '../primitives/motion';
import {
  WEAVE_DOTS,
  WEAVE_MARGIN,
  WEAVE_PERIOD,
  weaveStrands,
  strandSpan,
  type Strand,
} from './weave';

const STRANDS = weaveStrands(WEAVE_DOTS, WEAVE_DOTS);
const DOTS = Array.from({ length: WEAVE_DOTS * WEAVE_DOTS }, (_, i) => ({
  x: i % WEAVE_DOTS,
  y: Math.floor(i / WEAVE_DOTS),
}));
const SIDE = WEAVE_DOTS - 1 + WEAVE_MARGIN * 2;

const line = {
  fill: 'none',
  strokeWidth: 0.16,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** A weave: looping lines drawn around a grid of dots, then lifted again. */
export function WeaveLoader({ size = 24, speed, ...frame }: StatusLoaderProps) {
  return (
    <LoaderFrame {...frame}>
      {(reduced) => (
        <svg
          aria-hidden
          viewBox={`${-WEAVE_MARGIN} ${-WEAVE_MARGIN} ${SIDE} ${SIDE}`}
          width={size}
          height={size}
          className="shrink-0 overflow-visible"
        >
          {/* The whole pattern stays faintly visible, so the drawing has a shape to follow. */}
          {STRANDS.map((strand, i) => (
            <path key={i} d={strand.d} {...line} stroke="currentColor" strokeOpacity="0.14" />
          ))}
          {DOTS.map(({ x, y }) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="0.15" fill="currentColor" opacity="0.55" />
          ))}
          {reduced ? (
            STRANDS.map((strand, i) => (
              <path key={i} d={strand.d} {...line} stroke="var(--il-accent)" />
            ))
          ) : (
            <Drawing period={WEAVE_PERIOD / clampSpeed(speed)} />
          )}
        </svg>
      )}
    </LoaderFrame>
  );
}

function Drawing({ period }: { period: number }) {
  // One clock for every loop; nothing here re-renders React while it runs.
  const phase = useLoop(period);
  return STRANDS.map((strand, i) => (
    <DrawnStrand key={i} strand={strand} index={i} phase={phase} />
  ));
}

function DrawnStrand({
  strand,
  index,
  phase,
}: {
  strand: Strand;
  index: number;
  phase: MotionValue<number>;
}) {
  const span = useTransform(phase, (p) => strandSpan(p, index));
  const pathLength = useTransform(span, (s) => s.to - s.from);
  const pathOffset = useTransform(span, (s) => s.from);
  // A zero-length round-capped stroke still paints a dot, so hide it outright.
  const opacity = useTransform(pathLength, (l) => (l > 0.002 ? 1 : 0));
  return (
    <motion.path
      d={strand.d}
      {...line}
      stroke="var(--il-accent)"
      style={{ pathLength, pathOffset, opacity }}
    />
  );
}
