import { Link, type LinkProps } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { useId, type ReactNode } from 'react';
import { cx } from '@registry/components/interlude/primitives/cx';
import { SwapIcon } from '@registry/components/interlude/primitives/swap-icon';
import { useCopy } from '@registry/components/interlude/primitives/use-copy';
import { softSpring, spring } from '@registry/components/interlude/primitives/motion';
import {
  Pressable,
  type PressableProps,
} from '@registry/components/interlude/primitives/pressable';
import { useTint } from '@registry/components/interlude/primitives/tint';
import { useDragScroll } from './use-drag-scroll';

export { cx };

type Variant = 'solid' | 'line' | 'ghost';
type Size = 'sm' | 'md';

const shape = (variant: Variant, size: Size) =>
  cx(
    'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap disabled:opacity-40',
    size === 'md' ? 'h-10 rounded-control px-4 text-sm' : 'h-7 rounded-[7px] px-2.5 text-xs',
    variant === 'solid' && 'bg-fg text-bg',
    variant === 'line' && 'border border-line-strong text-fg',
    variant === 'ghost' && 'text-muted',
  );

const tintFor = (variant: Variant) =>
  variant === 'ghost' ? { hover: 7, press: 12 } : { hover: 5, press: 9 };

export function Button({
  variant = 'line',
  size = 'md',
  className,
  ...rest
}: PressableProps & { variant?: Variant; size?: Size }) {
  return (
    <Pressable
      solid={variant === 'solid'}
      tint={tintFor(variant)}
      className={cx(shape(variant, size), className)}
      {...rest}
    />
  );
}

/** A router link styled as a button; hover and press are Motion springs on the inner surface. */
export function ButtonLink({
  variant = 'line',
  size = 'md',
  children,
  className,
  ...link
}: LinkProps & { variant?: Variant; size?: Size; children: ReactNode; className?: string }) {
  const { style, ...tint } = useTint(tintFor(variant));
  const solid = variant === 'solid';
  return (
    <Link {...link} className={cx('inline-flex rounded-control', className)}>
      <motion.span
        {...(solid ? {} : tint)}
        style={solid ? undefined : style}
        whileHover={solid ? { filter: 'brightness(1.15)' } : undefined}
        whileTap={{ scale: 0.97 }}
        transition={spring}
        className={shape(variant, size)}
      >
        {children}
      </motion.span>
    </Link>
  );
}

/** Copies only after the write succeeds; says so if it fails. */
export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const { state, copy } = useCopy(1600);
  return (
    <Pressable
      onClick={() => copy(text)}
      dim={state === 'idle'}
      pressScale={0.88}
      aria-label={state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : label}
      className={cx(
        'grid size-7 shrink-0 place-items-center rounded-[7px]',
        state === 'copied' && 'text-accent',
      )}
    >
      <SwapIcon name={state === 'copied' ? 'check' : state === 'failed' ? 'x' : 'copy'} />
    </Pressable>
  );
}

/**
 * A segmented control whose selection pill glides between options. The
 * default is a bordered row of mono labels; `fill` is the equal-width, raised
 * thumb style used for form-like controls (in `columns` columns).
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  wrap = false,
  fill = false,
  columns,
  className,
}: {
  options: readonly { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** Let options flow onto several lines instead of scrolling. */
  wrap?: boolean;
  fill?: boolean;
  columns?: number;
  className?: string;
}) {
  const pill = useId();
  const scroll = useDragScroll<HTMLDivElement>();
  return (
    <div
      role="group"
      aria-label={label}
      ref={scroll.ref}
      {...(wrap || fill ? {} : scroll.handlers)}
      className={cx(
        fill
          ? 'grid gap-0.5 rounded-[9px] bg-fg/[0.06] p-0.5'
          : cx(
              'inline-flex max-w-full gap-0.5 rounded-[9px] border border-line p-0.5',
              wrap ? 'flex-wrap' : 'overflow-x-auto [scrollbar-width:none]',
            ),
        className,
      )}
      style={
        fill && columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined
      }
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cx(
              'relative h-7 rounded-[7px] outline-none focus-visible:ring-2 focus-visible:ring-accent',
              fill ? 'min-w-0 px-1.5 text-[12px]' : 'shrink-0 px-2.5 font-mono text-[11px]',
            )}
          >
            {on && (
              <motion.span
                layoutId={pill}
                transition={softSpring}
                className={cx(
                  'absolute inset-0 rounded-[7px]',
                  fill
                    ? 'bg-raised shadow-[0_1px_2px_rgb(0_0_0/0.18),0_0_0_0.5px_rgb(0_0_0/0.06)] dark:bg-fg/[0.14]'
                    : 'bg-fg/[0.09]',
                )}
              />
            )}
            <motion.span
              className={cx('relative', fill && 'block truncate')}
              initial={false}
              animate={{ opacity: on ? 1 : fill ? 0.55 : 0.5 }}
              whileHover={{ opacity: on ? 1 : fill ? 0.85 : 0.8 }}
              transition={spring}
            >
              {o.label}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-5 items-center rounded-full border border-line px-2 font-mono text-[10px] text-muted">
      {children}
    </span>
  );
}
