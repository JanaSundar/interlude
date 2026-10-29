export type Orbit = {
  radius: number;
  period: number;
  dot: number;
  /** How solid the satellite is; inner ones are fainter and outer ones solid. */
  opacity: number;
};

/** Inner orbits run faster, like a small planetary system. */
export const ORBITS: Orbit[] = [
  { radius: 4.5, period: 0.9, dot: 2.1, opacity: 0.45 },
  { radius: 7.5, period: 1.5, dot: 1.85, opacity: 0.7 },
  { radius: 10.5, period: 2.4, dot: 1.6, opacity: 1 },
];

/** Seconds of delay between one satellite and the next, unless a prop says otherwise. */
export const DEFAULT_STAGGER = 0.3;

/**
 * Pure: a satellite's own clock: the shared time, held back `stagger` seconds
 * per orbit. This is the only thing that spreads them out; at 0 they all start
 * at the same angle (and then drift apart, since inner orbits run faster).
 */
export const delayedSeconds = (seconds: number, index: number, stagger: number): number =>
  seconds - index * stagger;

/** Pure: position on an orbit after `seconds`. */
export function orbitPoint(orbit: Orbit, seconds: number): { x: number; y: number } {
  const angle = (seconds / orbit.period) * Math.PI * 2;
  return { x: Math.cos(angle) * orbit.radius, y: Math.sin(angle) * orbit.radius };
}
