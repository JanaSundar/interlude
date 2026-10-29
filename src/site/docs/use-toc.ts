import { useEffect, useRef, useState, type RefObject } from 'react';
import { activeIndex, readingLine, readToc, sameToc, type TocEntry } from './toc';

/** Where the reader's eye is: just below the sticky header. */
const READING_LINE = 112;

/**
 * Builds the outline from whatever headings the article rendered, and
 * tracks which one is being read. Re-reads when `key` (the page) changes or
 * the article's content changes, so the outline never needs maintaining.
 */
export function useToc(article: RefObject<HTMLElement | null>, key: string) {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [active, setActive] = useState<string | null>(null);
  // A heading picked in the outline stays selected until the reader scrolls
  // themselves, even if the page can't bring it all the way to the top.
  const pinned = useRef<string | null>(null);

  useEffect(() => {
    const root = article.current;
    if (!root) return;
    pinned.current = null;
    const read = () => {
      const next = readToc(root);
      setEntries((prev) => (sameToc(prev, next) ? prev : next));
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [article, key]);

  useEffect(() => {
    if (entries.length === 0) {
      setActive(null);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      if (pinned.current) return setActive(pinned.current);
      const tops = entries.map(
        (e) => document.getElementById(e.id)?.getBoundingClientRect().top ?? Infinity,
      );
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const line = readingLine(READING_LINE, window.innerHeight, {
        remaining: scrollable - window.scrollY,
        scrollable,
      });
      setActive(entries[activeIndex(tops, line)]?.id ?? null);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const unpin = () => {
      pinned.current = null;
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('wheel', unpin, { passive: true });
    window.addEventListener('touchmove', unpin, { passive: true });
    window.addEventListener('keydown', unpin);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', unpin);
      window.removeEventListener('touchmove', unpin);
      window.removeEventListener('keydown', unpin);
    };
  }, [entries]);

  const select = (id: string) => {
    pinned.current = id;
    setActive(id);
  };

  return { entries, active, select };
}
