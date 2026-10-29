import { motion, useTime, useTransform } from 'motion/react';
import { LoaderFrame, type StatusLoaderProps } from '../primitives/loader-frame';
import { clampSpeed } from '../primitives/motion';
import { orbitPoint, ORBITS, type Orbit } from './orbits';

/** Three satellites on nested orbits. Positions come from one clock, outside React renders. */
export function OrbitalLoader({ size = 18, speed, ...frame }: StatusLoaderProps) {
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
              <StaticSatellite key={i} orbit={orbit} />
            ) : (
              <Satellite key={i} orbit={orbit} speed={clampSpeed(speed)} />
            ),
          )}
        </svg>
      )}
    </LoaderFrame>
  );
}

function StaticSatellite({ orbit }: { orbit: Orbit }) {
  const { x, y } = orbitPoint(orbit, 0);
  return <circle cx={x} cy={y} r={orbit.dot} fill="var(--il-accent)" />;
}

function Satellite({ orbit, speed }: { orbit: Orbit; speed: number }) {
  const time = useTime();
  const cx = useTransform(time, (ms) => orbitPoint(orbit, (ms / 1000) * speed).x);
  const cy = useTransform(time, (ms) => orbitPoint(orbit, (ms / 1000) * speed).y);
  return <motion.circle cx={cx} cy={cy} r={orbit.dot} fill="var(--il-accent)" />;
}
