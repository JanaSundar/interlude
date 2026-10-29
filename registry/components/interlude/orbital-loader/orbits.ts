export type Orbit = { radius: number; period: number; dot: number; offset: number };

/** Inner orbits run faster, like a small planetary system. */
export const ORBITS: Orbit[] = [
  { radius: 4.5, period: 0.9, dot: 2.1, offset: 0 },
  { radius: 7.5, period: 1.5, dot: 1.85, offset: 0.33 },
  { radius: 10.5, period: 2.4, dot: 1.6, offset: 0.66 },
];

/** Pure: position on an orbit after `seconds`. */
export function orbitPoint(orbit: Orbit, seconds: number): { x: number; y: number } {
  const angle = (seconds / orbit.period + orbit.offset) * Math.PI * 2;
  return { x: Math.cos(angle) * orbit.radius, y: Math.sin(angle) * orbit.radius };
}
