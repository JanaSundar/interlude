import { useEffect, useRef } from 'react';

/** Pure: the typed-so-far buffer after `key`, kept to at most `word.length` characters. */
export function typed(buffer: string, key: string, word: string): string {
  if (key.length !== 1) return buffer;
  return (buffer + key.toLowerCase()).slice(-word.length);
}

/** Calls `onMatch` whenever `word` is typed on the page, outside of form fields. */
export function useSecretWord(word: string, onMatch: () => void) {
  const handler = useRef(onMatch);
  handler.current = onMatch;
  useEffect(() => {
    let buffer = '';
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const { target } = e;
      if (
        target instanceof Element &&
        target.closest('input, textarea, [contenteditable], [data-il-stage]')
      ) {
        return;
      }
      buffer = typed(buffer, e.key, word);
      if (buffer === word) {
        buffer = '';
        handler.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [word]);
}
