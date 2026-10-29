import { useEffect, useRef } from 'react';

export type GameLoop = {
  /** Advance the simulation by one fixed step (milliseconds). */
  update: (stepMs: number) => void;
  /** Draw the current state; alpha in [0, 1) is the progress towards the next step. */
  render: (alpha: number) => void;
};

/**
 * Fixed-timestep loop on requestAnimationFrame. The simulation stays
 * deterministic regardless of frame rate, and the loop fully stops (no frame
 * requested) whenever `running` is false or the component unmounts.
 */
export function useGameLoop(loop: GameLoop, stepMs: number, running: boolean) {
  const latest = useRef(loop);
  latest.current = loop;

  useEffect(() => {
    // Draw once even while paused so the board is never blank.
    latest.current.render(0);
    if (!running) return;
    let frame = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      // Clamp long gaps (tab switch, breakpoint) so we never fast-forward.
      acc += Math.min(now - last, 250);
      last = now;
      while (acc >= stepMs) {
        latest.current.update(stepMs);
        acc -= stepMs;
      }
      latest.current.render(acc / stepMs);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, stepMs]);
}

/** setTimeout that is cleared on unmount, pause, or when deps change. */
export function useTimeout(callback: () => void, delayMs: number | null) {
  const latest = useRef(callback);
  latest.current = callback;
  useEffect(() => {
    if (delayMs === null) return;
    const id = setTimeout(() => latest.current(), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);
}
