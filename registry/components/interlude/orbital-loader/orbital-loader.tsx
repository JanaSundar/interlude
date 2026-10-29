import { motion, useTime, useTransform } from 'motion/react';
import { LoaderFrame, type StatusLoaderProps } from '../primitives/loader-frame';
import { clampSpeed } from '../primitives/motion';
import { DEFAULT_STAGGER, delayedSeconds, orbitPoint, ORBITS, type Orbit } from './orbits';

export type OrbitalLoaderProps = StatusLoaderProps & {
  /** Seconds of delay between one satellite and the next, from the inside out. 0 starts them all at the same angle. */
  stagger?: number;
};

/** Three satellites on nested orbits. Positions come from one clock, outside React renders. */
export function OrbitalLoader({
  size = 18,
  speed,
  stagger = DEFAULT_STAGGER,
  ...frame
}: OrbitalLoaderProps) {
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
          {/* Faint tracks give the motion a shape to read against, on light or dark. */}
          {ORBITS.map((orbit, i) => (
            <circle
              key={`track-${i}`}
              r={orbit.radius}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.14"
              strokeWidth="0.75"
            />
          ))}
          <circle r="1.8" fill="var(--il-accent)" />
          {ORBITS.map((orbit, i) =>
            reduced ? (
              <StaticSatellite key={i} orbit={orbit} index={i} stagger={Math.max(0, stagger)} />
            ) : (
              <Satellite
                key={i}
                orbit={orbit}
                index={i}
                stagger={Math.max(0, stagger)}
                speed={clampSpeed(speed)}
              />
            ),
          )}
        </svg>
      )}
    </LoaderFrame>
  );
}

function StaticSatellite({
  orbit,
  index,
  stagger,
}: {
  orbit: Orbit;
  index: number;
  stagger: number;
}) {
  const { x, y } = orbitPoint(orbit, delayedSeconds(0, index, stagger));
  return <circle cx={x} cy={y} r={orbit.dot} fill="var(--il-accent)" fillOpacity={orbit.opacity} />;
}

function Satellite({
  orbit,
  index,
  stagger,
  speed,
}: {
  orbit: Orbit;
  index: number;
  stagger: number;
  speed: number;
}) {
  const time = useTime();
  const at = (ms: number) => orbitPoint(orbit, delayedSeconds(ms / 1000, index, stagger) * speed);
  const cx = useTransform(time, (ms) => at(ms).x);
  const cy = useTransform(time, (ms) => at(ms).y);
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={orbit.dot}
      fill="var(--il-accent)"
      fillOpacity={orbit.opacity}
    />
  );
}
