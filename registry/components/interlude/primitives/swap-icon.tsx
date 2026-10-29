import { AnimatePresence, motion } from 'motion/react';
import { Icon, type IconName } from './icons';
import { fade } from './motion';

/** An icon that pops out and the next one in when `name` changes. */
export function SwapIcon({ name, className }: { name: IconName; className?: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={name}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={fade}
      >
        <Icon name={name} className={className} />
      </motion.span>
    </AnimatePresence>
  );
}
