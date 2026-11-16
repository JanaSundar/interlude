import { motion, useTransform, type MotionValue } from 'motion/react';
import { LoaderFrame, type StatusLoaderProps } from '../primitives/loader-frame';
import { useLoop } from '../primitives/loop';
import { clampSpeed } from '../primitives/motion';
import { FLORAL_PERIOD, PETAL_PATH, petalAngle, petalFrame, petalOpen, PETALS } from './petals';

const INDEXES = Array.from({ length: PETALS }, (_, i) => i);

/** A flower that opens petal by petal around its centre, then folds back to a bud. */
export function FloralLoader({ size = 20, speed, ...frame }: StatusLoaderProps) {
  return (
    <LoaderFrame {...frame}>
      {(reduced) => (
        <svg
          aria-hidden
          viewBox="-12 -12 24 24"
          width={size}
          height={size}
          className="shrink-0 overflow-visible"
        >
          {INDEXES.map((i) => (
            <g key={i} transform={`rotate(${petalAngle(i)})`}>
              {/* A faint outline of the open flower gives the bloom a shape to grow into. */}
              <path
                d={PETAL_PATH}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.14"
                strokeWidth="0.75"
              />
              {reduced ? (
                <path d={PETAL_PATH} fill="var(--il-accent)" fillOpacity="0.8" />
              ) : (
                <Petal index={i} period={FLORAL_PERIOD / clampSpeed(speed)} />
              )}
            </g>
          ))}
          <circle r="1.9" fill="var(--il-accent)" />
        </svg>
      )}
    </LoaderFrame>
  );
}

function Petal({ index, period }: { index: number; period: number }) {
  // Every petal reads the same clock; nothing here re-renders React while it runs.
  const phase: MotionValue<number> = useLoop(period);
  const frame = useTransform(phase, (p) => petalFrame(petalOpen(p, index)));
  const scale = useTransform(frame, (f) => f.scale);
  const opacity = useTransform(frame, (f) => f.opacity * 0.8);
  return (
    <motion.path
      d={PETAL_PATH}
      fill="var(--il-accent)"
      // Grow from the petal's base at the centre of the flower, not from its middle.
      style={{ scale, opacity, transformBox: 'fill-box', originX: 0.5, originY: 1 }}
    />
  );
}
