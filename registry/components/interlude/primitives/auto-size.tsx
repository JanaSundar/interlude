import { motion } from 'motion/react';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from './cx';
import { resize } from './motion';

type Size = number | 'auto';

/**
 * Tracks an element's rendered size. Stays 'auto' until measured, or
 * forever where ResizeObserver doesn't exist (tests, very old browsers),
 * so content is never clipped for lack of a measurement.
 */
export function useMeasure<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<{ width: Size; height: Size }>({
    width: 'auto',
    height: 'auto',
  });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const read = () => setSize({ width: el.offsetWidth, height: el.offsetHeight });
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { ref, ...size };
}

/**
 * Block wrapper whose height springs to fit its content. Put state swaps
 * (AnimatePresence) inside it and everything below glides instead of jumping.
 */
export function AutoHeight({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, height } = useMeasure<HTMLDivElement>();
  return (
    <motion.div
      className={cx('overflow-hidden', className)}
      initial={false}
      animate={{ height }}
      transition={{ height: resize }}
    >
      {/* flow-root keeps child margins inside the measured box. */}
      <div ref={ref} className="relative flow-root">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Inline wrapper whose width springs to fit its content, for labels and
 * indicators that change length with state. Not clipped, so focus rings
 * and popped-out exiting content stay visible.
 */
export function AutoWidth({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, width } = useMeasure<HTMLSpanElement>();
  return (
    <motion.span
      className={cx('inline-flex', className)}
      initial={false}
      animate={{ width }}
      transition={{ width: resize }}
    >
      <span ref={ref} className="relative inline-flex w-max shrink-0 items-center">
        {children}
      </span>
    </motion.span>
  );
}
