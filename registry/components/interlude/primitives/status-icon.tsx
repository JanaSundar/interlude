import { AnimatePresence, motion, useReducedMotionConfig, useTransform } from 'motion/react';
import { cx } from './cx';
import { Icon, type IconName } from './icons';
import { useLoop } from './loop';
import { spring } from './motion';
import { statusKind, type Status, type StatusKind } from './status';
import { kindText } from './tokens';

const glyphs: Partial<Record<StatusKind, IconName>> = {
  waiting: 'pause',
  success: 'check',
  error: 'x',
  cancelled: 'minus',
};

/**
 * A shape per status (ring, spinning arc, pause, check, cross, dash) so state
 * never depends on colour. Swaps with a small spring when the status changes.
 */
export function StatusIcon({ status, className }: { status: Status; className?: string }) {
  const kind = statusKind(status);
  const glyph = glyphs[kind];
  return (
    <span
      aria-hidden
      className={cx('relative grid size-4 shrink-0 place-items-center', kindText[kind], className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={kind}
          className="grid place-items-center"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={spring}
        >
          {glyph ? <Icon name={glyph} /> : kind === 'active' ? <Spinner /> : <Ring />}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Ring() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5">
      <circle
        cx="8"
        cy="8"
        r="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2.2"
      />
    </svg>
  );
}

function Spinner() {
  // Driven by the shared clock; under reduced motion the arc stays put.
  const still = useReducedMotionConfig();
  const phase = useLoop(0.9);
  const rotate = useTransform(phase, (p) => (still ? 0 : p * 360));
  return (
    <motion.svg viewBox="0 0 16 16" className="size-3.5" style={{ rotate }}>
      <circle
        cx="8"
        cy="8"
        r="5"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />
      <path
        d="M8 3a5 5 0 0 1 5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}
