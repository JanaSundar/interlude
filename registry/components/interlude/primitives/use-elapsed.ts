import { useEffect, useState } from 'react';

/**
 * Whole seconds since `since` (epoch ms), ticking once a second while
 * `running`. Returns null when no start time was supplied: nothing is guessed.
 */
export function useElapsed(since: number | undefined, running: boolean): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running || since === undefined) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running, since]);
  if (since === undefined) return null;
  return Math.max(0, Math.floor((now - since) / 1000));
}
