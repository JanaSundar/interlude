import { motion, type HTMLMotionProps } from 'motion/react';
import { cx } from './cx';
import { spring } from './motion';
import { useTint, type TintLevels } from './tint';
import { focusRing } from './tokens';

export type PressableProps = Omit<HTMLMotionProps<'button'>, 'style'> & {
  tint?: TintLevels;
  /** Start dimmed and brighten on hover/focus, for quiet icon buttons. */
  dim?: boolean;
  /** Filled buttons keep their background and brighten instead of tinting. */
  solid?: boolean;
  /** Scale on press; 1 disables. */
  pressScale?: number;
  style?: HTMLMotionProps<'button'>['style'];
};

/**
 * The one interactive surface every component uses: a real button whose
 * hover tint, dimming and press feedback are all Motion springs.
 */
export function Pressable({
  tint,
  dim = false,
  solid = false,
  pressScale = 0.97,
  className,
  style,
  disabled,
  type = 'button',
  ...rest
}: PressableProps) {
  const { style: tintStyle, ...tintHandlers } = useTint(tint);
  const live = !disabled;
  const hover = solid ? { filter: 'brightness(1.1)' } : dim ? { opacity: 1 } : undefined;
  return (
    <motion.button
      type={type}
      disabled={disabled}
      {...(live && !solid ? tintHandlers : {})}
      initial={dim ? { opacity: 0.6 } : false}
      animate={{
        ...(dim ? { opacity: disabled ? 0.3 : 0.6 } : {}),
        ...(solid ? { filter: 'brightness(1)' } : {}),
      }}
      whileHover={live ? hover : undefined}
      whileFocus={dim ? { opacity: 1 } : undefined}
      whileTap={live && pressScale !== 1 ? { scale: pressScale } : undefined}
      transition={spring}
      style={{ ...(solid ? {} : tintStyle), ...style }}
      className={cx(focusRing, disabled ? 'cursor-not-allowed' : 'cursor-pointer', className)}
      {...rest}
    />
  );
}
