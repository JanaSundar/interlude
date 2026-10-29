import { useEffect, useRef, useState } from 'react';

export type CopyState = 'idle' | 'copied' | 'failed';

/**
 * Copies text and reports honestly: "copied" only once the clipboard write has
 * succeeded, "failed" when it is blocked (permissions, insecure context). The
 * state returns to idle after `resetMs`.
 */
export function useCopy(resetMs = 1800) {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (text: string) => {
    let next: CopyState = 'failed';
    try {
      await navigator.clipboard.writeText(text);
      next = 'copied';
    } catch {
      // Clipboard can be blocked by permissions or an insecure context.
    }
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), resetMs);
  };

  return { state, copy };
}
