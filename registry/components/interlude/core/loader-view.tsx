import { motion, type Variants } from 'motion/react';
import type { Ref } from 'react';
import { DotMatrix, type DotPattern } from '../primitives/dot-matrix';
import { cx } from '../primitives/cx';

const hintVariants: Variants = {
  rest: { opacity: 0, x: -4 },
  hover: { opacity: 0.55, x: 0 },
};

export function LoaderView({
  layoutId,
  pattern,
  name,
  label,
  size,
  speed,
  reduced,
  hint,
  autoFocus,
  onDiscover,
  ref,
}: {
  /** AnimatePresence's popLayout mode needs the root node to measure and remove it. */
  ref?: Ref<HTMLButtonElement>;
  layoutId: string;
  pattern: DotPattern;
  name: string;
  label?: string;
  size: number;
  speed: number;
  reduced: boolean;
  hint: boolean;
  autoFocus: boolean;
  onDiscover: () => void;
}) {
  return (
    <motion.button
      ref={ref}
      type="button"
      autoFocus={autoFocus}
      onClick={onDiscover}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      whileTap={{ scale: 0.97 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      aria-label={`${label ? `${label}. ` : ''}Play ${name} while you wait`}
      className={cx(
        'group inline-flex max-w-full cursor-pointer items-center gap-2.5 rounded-md py-1 pr-2 pl-1 text-left outline-none',
        'focus-visible:ring-2 focus-visible:ring-(--il-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
      )}
    >
      <DotMatrix
        layoutId={layoutId}
        pattern={pattern}
        size={size}
        speed={speed}
        reduced={reduced}
      />
      {label && <span className="truncate text-sm opacity-70">{label}</span>}
      <motion.span
        aria-hidden
        variants={hint ? undefined : hintVariants}
        className={cx('font-mono text-[10px] tracking-wide uppercase', hint && 'opacity-40')}
      >
        play
      </motion.span>
    </motion.button>
  );
}
