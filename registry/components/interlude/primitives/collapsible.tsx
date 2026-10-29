import { AnimatePresence, motion } from 'motion/react';
import { useId, useState, type ReactNode } from 'react';
import { useMeasure } from './auto-size';
import { collapse } from './motion';

/** Open state plus the ARIA wiring between a trigger and its panel. */
export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  const panelId = useId();
  return {
    open,
    setOpen,
    panelId,
    triggerProps: {
      'aria-expanded': open,
      'aria-controls': panelId,
      onClick: () => setOpen((o) => !o),
    },
  };
}

/**
 * Height-animated panel. The content is measured, so the panel also glides
 * when its content changes while open (a result arriving, an error
 * replacing it), not only when it opens and closes.
 */
export function Collapsible({
  open,
  id,
  children,
}: {
  open: boolean;
  id?: string;
  children: ReactNode;
}) {
  const { ref: inner, height } = useMeasure<HTMLDivElement>([open]);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id={id}
          key="panel"
          className="overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={collapse}
        >
          {/* flow-root keeps child margins inside the measured box. */}
          <div ref={inner} className="flow-root">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
