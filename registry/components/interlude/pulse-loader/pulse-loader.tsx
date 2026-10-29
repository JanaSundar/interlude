import { motion, useTransform } from 'motion/react';
import { LoaderFrame, type StatusLoaderProps } from '../primitives/loader-frame';
import { useLoop, wave } from '../primitives/loop';
import { clampSpeed } from '../primitives/motion';

const RINGS = [0, 0.5];
const PERIOD = 1.6;

/** A core with rings breathing outward. Reduced motion shows the still core. */
export function PulseLoader({ size = 18, speed, ...frame }: StatusLoaderProps) {
  const period = PERIOD / clampSpeed(speed);
  return (
    <LoaderFrame {...frame}>
      {(reduced) => (
        <span
          aria-hidden
          className="relative grid shrink-0 place-items-center"
          style={{ width: size, height: size }}
        >
          {!reduced && RINGS.map((offset) => <Ring key={offset} period={period} offset={offset} />)}
          {reduced ? (
            <span className="size-[40%] rounded-full bg-(--il-accent)" />
          ) : (
            <Core period={period} />
          )}
        </span>
      )}
    </LoaderFrame>
  );
}

/** Expands from the core and fades out, half a cycle apart from its sibling. */
function Ring({ period, offset }: { period: number; offset: number }) {
  const phase = useLoop(period, offset);
  const scale = useTransform(phase, (p) => 0.3 + 0.7 * (1 - (1 - p) ** 2));
  const opacity = useTransform(phase, (p) => 0.95 * (1 - p));
  return (
    <motion.span
      className="absolute inset-0 rounded-full border-2 border-(--il-accent)"
      style={{ scale, opacity }}
    />
  );
}

function Core({ period }: { period: number }) {
  const phase = useLoop(period);
  const opacity = useTransform(phase, (p) => 1 - 0.45 * wave(p));
  return <motion.span className="size-[40%] rounded-full bg-(--il-accent)" style={{ opacity }} />;
}
