import { motion, type HTMLMotionProps } from 'motion/react';
import { fade } from './motion';

/**
 * A block that fades in and out with the shared fade timing. Give it a `key`
 * inside AnimatePresence; `lift` also slides it up a few pixels on entry.
 */
export function Fade({
  lift = false,
  ...rest
}: { lift?: boolean } & Omit<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit' | 'transition'
>) {
  return (
    <motion.div
      initial={lift ? { opacity: 0, y: 4 } : { opacity: 0 }}
      animate={lift ? { opacity: 1, y: 0 } : { opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={fade}
      {...rest}
    />
  );
}
