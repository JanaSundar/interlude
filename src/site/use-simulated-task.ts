import { useCallback, useEffect, useRef, useState } from 'react';
import type { TaskStatus } from '@registry/components/interlude/core/lifecycle';

/**
 * A fake async task for demos: no network, no provider. It resolves on a
 * timer, or immediately through `finish`. The timer is always cleared.
 */
export function useSimulatedTask(initial: TaskStatus = 'idle') {
  const [status, setStatus] = useState<TaskStatus>(initial);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const start = useCallback((durationMs: number, outcome: TaskStatus = 'success') => {
    clearTimeout(timer.current);
    setStatus('loading');
    timer.current = setTimeout(() => setStatus(outcome), durationMs);
  }, []);

  const finish = useCallback((outcome: TaskStatus) => {
    clearTimeout(timer.current);
    setStatus(outcome);
  }, []);

  return { status, start, finish, loading: status === 'loading' };
}
