import { motion, useIsPresent, type HTMLMotionProps } from 'motion/react';

/**
 * A crossfade child that leaves the accessibility tree and stops taking
 * input the moment it starts exiting, so stale controls or status can't be
 * read or clicked during the fade. Renders a span, or a div with `block`.
 */
export function PresenceSlot({
  block = false,
  ...props
}: HTMLMotionProps<'span'> & { block?: boolean }) {
  const present = useIsPresent();
  const exiting = { 'aria-hidden': present ? undefined : true, inert: !present };
  return block ? (
    <motion.div {...exiting} {...(props as HTMLMotionProps<'div'>)} />
  ) : (
    <motion.span {...exiting} {...props} />
  );
}
