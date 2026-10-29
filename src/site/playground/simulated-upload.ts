import { useEffect, useState } from 'react';

/** Uneven chunk sizes, like a real upload: progress arrives in bursts, not a smooth line. */
const CHUNKS = [0.08, 0.05, 0.11, 0.03, 0.09, 0.14, 0.04, 0.1, 0.07, 0.12, 0.06, 0.11];
/** Ticks to hold at 100% before the next upload starts. */
const HOLD = 5;
export const TICK_MS = 260;

const DONE_AT = (() => {
  let total = 0;
  let ticks = 0;
  while (total < 1) total += CHUNKS[ticks++ % CHUNKS.length]!;
  return ticks;
})();

/** Pure: fraction uploaded after `tick` ticks; loops after a short hold at 100%. */
export function uploadProgress(tick: number): number {
  const t = tick % (DONE_AT + HOLD);
  let total = 0;
  for (let i = 0; i < t && total < 1; i++) total += CHUNKS[i % CHUNKS.length]!;
  return Math.min(1, Number(total.toFixed(4)));
}

/**
 * The playground plays the host app: a looping, simulated upload that
 * reports progress. It only ticks while `running`, and the timer is always
 * cleared.
 */
export function useSimulatedUpload(running: boolean): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [running]);
  return uploadProgress(tick);
}
