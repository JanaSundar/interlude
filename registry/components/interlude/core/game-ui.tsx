import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../primitives/cx';
import { spring } from '../primitives/motion';

/** Score / moves / timer readouts. Values pop when they change. */
export function Hud({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] tabular-nums">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-baseline gap-1 rounded-full bg-current/[0.06] px-2 py-0.5"
        >
          <span className="opacity-60">{item.label}</span>
          <motion.span
            key={item.value}
            initial={{ y: -3, opacity: 0.4 }}
            animate={{ y: 0, opacity: 1 }}
            transition={spring}
          >
            {item.value}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

/** Score and remaining lives as dots, for games that take lives. */
export function ScoreLivesHud({ score, lives }: { score: number; lives: number }) {
  return (
    <Hud
      items={[
        { label: 'score', value: score },
        { label: 'lives', value: '•'.repeat(lives) || '–' },
      ]}
    />
  );
}

export function GameOverlay({
  show,
  title,
  detail,
  action,
  onAction,
  autoFocus = false,
}: {
  show: boolean;
  title: string;
  detail?: ReactNode;
  action?: string;
  onAction?: () => void;
  /** Only for end states reached while the player is focused in the stage. */
  autoFocus?: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[inherit] bg-(--il-scrim) text-center backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.p
            className="text-sm font-medium"
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...spring, delay: 0.05 }}
          >
            {title}
          </motion.p>
          {detail && <p className="font-mono text-[11px] opacity-60">{detail}</p>}
          {action && onAction && (
            <motion.button
              type="button"
              autoFocus={autoFocus}
              onClick={(e) => {
                // The button unmounts with the overlay; keep focus in the stage.
                const stage = e.currentTarget.closest<HTMLElement>('[data-il-stage]');
                onAction();
                stage?.focus({ preventScroll: true });
              }}
              whileTap={{ scale: 0.96 }}
              className="mt-1 cursor-pointer rounded-full bg-(--il-accent) px-3.5 py-1.5 text-xs font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-(--il-accent) focus-visible:ring-offset-2"
            >
              {action}
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type Burst = { id: number; x: number; y: number };

/** Short-lived hit/impact rings, positioned in logical board units. */
export function useBursts() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);
  const add = useCallback((x: number, y: number) => {
    const id = nextId.current++;
    setBursts((list) => [...list.slice(-8), { id, x, y }]);
  }, []);
  const remove = useCallback((id: number) => {
    setBursts((list) => list.filter((b) => b.id !== id));
  }, []);
  const clear = useCallback(() => setBursts([]), []);
  return { bursts, add, remove, clear };
}

export function Bursts({
  bursts,
  width,
  height,
  reduced,
  onDone,
}: {
  bursts: Burst[];
  width: number;
  height: number;
  reduced: boolean;
  onDone: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {bursts.map((b) => (
        <motion.span
          key={b.id}
          className="absolute size-4 -translate-1/2 rounded-full border-2 border-(--il-accent)"
          style={{ left: `${(b.x / width) * 100}%`, top: `${(b.y / height) * 100}%` }}
          initial={{ scale: reduced ? 1 : 0.2, opacity: 1 }}
          animate={{ scale: reduced ? 1 : 1.6, opacity: 0 }}
          transition={{ duration: reduced ? 0.25 : 0.4, ease: 'easeOut' }}
          onAnimationComplete={() => onDone(b.id)}
        />
      ))}
    </div>
  );
}

/** Board frame shared by every game: keeps aspect ratio and clips overlays. */
export function Board({
  aspect,
  children,
  className,
  ...rest
}: {
  aspect: number;
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'relative w-full touch-none select-none overflow-hidden rounded-[10px]',
        className,
      )}
      style={{ aspectRatio: aspect }}
      {...rest}
    >
      {children}
    </div>
  );
}
