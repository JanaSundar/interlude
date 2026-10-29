import { useTime, useTransform, type MotionValue } from 'motion/react';

/** Pure: position in [0, 1) through a cycle of `period` seconds. */
export function loopPhase(seconds: number, period: number): number {
  return (((seconds / period) % 1) + 1) % 1;
}

/** Pure: 0 → 1 → 0 once per cycle, smooth at both ends. */
export const wave = (phase: number) => 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);

/**
 * A motion value that cycles 0 → 1 every `period` seconds, shifted by
 * `offset` cycles. Every looping animation derives from this one clock
 * instead of repeating keyframes, which can stall on their last frame.
 * Updates never re-render React.
 */
export function useLoop(period: number, offset = 0): MotionValue<number> {
  const time = useTime();
  return useTransform(time, (ms) => loopPhase(ms / 1000 + offset * period, period));
}
