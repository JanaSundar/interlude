import { useMotionTemplate, useSpring, type MotionValue } from 'motion/react';

export type TintLevels = { rest?: number; hover?: number; press?: number };

/**
 * Hover and press feedback as a spring, not a CSS transition. The level is a
 * motion value (percent of currentColor mixed into the background), composed
 * with useMotionTemplate so it updates without React re-renders.
 */
export function useTint({ rest = 0, hover = 6, press = 11 }: TintLevels = {}) {
  const level = useSpring(rest, { stiffness: 520, damping: 38 });
  const backgroundColor: MotionValue<string> = useMotionTemplate`color-mix(in oklab, currentColor ${level}%, transparent)`;
  return {
    style: { backgroundColor },
    onHoverStart: () => level.set(hover),
    onHoverEnd: () => level.set(rest),
    onTapStart: () => level.set(press),
    onTap: () => level.set(hover),
    onTapCancel: () => level.set(rest),
  };
}
