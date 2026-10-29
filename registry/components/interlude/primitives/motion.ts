import { useReducedMotion } from 'motion/react';
import { clamp } from './math';

/** Snappy feedback: presses, value pops, small toggles. */
export const spring = { type: 'spring', stiffness: 520, damping: 34, mass: 0.8 } as const;
/** Continuity: panels opening, layout shifts, content arriving. */
export const softSpring = { type: 'spring', stiffness: 260, damping: 28 } as const;
/** Fades that must never delay real feedback. */
export const fade = { duration: 0.16, ease: [0.22, 1, 0.36, 1] } as const;

export type ReducedMotion = 'user' | 'always' | 'never';

/** Resolves a component's reducedMotion prop against the OS preference. */
export function useReducedPreference(preference: ReducedMotion = 'user'): boolean {
  const os = useReducedMotion();
  return preference === 'always' || (preference === 'user' && !!os);
}

/** Speed multipliers are always kept to a range that stays legible. */
export const clampSpeed = (speed = 1) => clamp(speed, 0.5, 2);

/** Size changes: critically damped, so boxes never overshoot or wobble. */
export const resize = { type: 'spring', stiffness: 420, damping: 42, mass: 0.9 } as const;

/** Panels opening and closing: size springs, content fades quickly. */
export const collapse = {
  height: resize,
  opacity: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
} as const;
