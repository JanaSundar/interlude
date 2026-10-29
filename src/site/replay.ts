import { useCallback, useEffect, useMemo, useState } from 'react';

export type Timed<T> = { at: number; value: T };

/**
 * Plays a scripted timeline for demos and returns the values released so
 * far. State is always derived from that prefix, never mutated, so a replay
 * is just a new run id. Every timer is cleared on replay and unmount.
 */
export function useReplay<T>(timeline: readonly Timed<T>[], { autoplay = true } = {}) {
  const [run, setRun] = useState(autoplay ? 1 : 0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    if (run === 0) return;
    const timers = timeline.map((e, i) => setTimeout(() => setCount(i + 1), e.at));
    return () => timers.forEach(clearTimeout);
  }, [timeline, run]);

  const released = useMemo(() => timeline.slice(0, count).map((e) => e.value), [timeline, count]);
  const replay = useCallback(() => setRun((r) => r + 1), []);
  return {
    released,
    done: count === timeline.length,
    playing: run > 0 && count < timeline.length,
    replay,
  };
}

/** Spreads chunks of text over a duration, for streaming demos. */
export function chunkText(
  text: string,
  start: number,
  msPerChunk: number,
  size = 3,
): Timed<string>[] {
  const words = text.split(/(?<=\s)/);
  const out: Timed<string>[] = [];
  for (let i = 0; i < words.length; i += size) {
    out.push({ at: start + (i / size) * msPerChunk, value: words.slice(i, i + size).join('') });
  }
  return out;
}
