import { Link, type LinkProps } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cx } from '@registry/components/interlude/primitives/cx';
import { Icon } from '@registry/components/interlude/primitives/icons';
import { fade, softSpring, spring } from '@registry/components/interlude/primitives/motion';
import {
  Pressable,
  type PressableProps,
} from '@registry/components/interlude/primitives/pressable';
import { useTint } from '@registry/components/interlude/primitives/tint';

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
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    let next: 'ok' | 'fail' = 'fail';
    try {
      await navigator.clipboard.writeText(text);
      next = 'ok';
    } catch {
      // Clipboard unavailable (permissions or insecure context).
    }
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 1600);
  };
  return (
    <Pressable
      onClick={copy}
      dim={state === 'idle'}
      pressScale={0.88}
      aria-label={state === 'ok' ? 'Copied' : state === 'fail' ? 'Copy failed' : label}
      className={cx(
        'grid size-7 shrink-0 place-items-center rounded-[7px]',
        state === 'ok' && 'text-accent',
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={state}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={fade}
        >
          <Icon name={state === 'ok' ? 'check' : state === 'fail' ? 'x' : 'copy'} />
        </motion.span>
      </AnimatePresence>
    </Pressable>
  );
}

/** A segmented control whose selection pill glides between options. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  wrap = false,
  className,
}: {
  options: readonly { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** Let options flow onto several lines instead of scrolling. */
  wrap?: boolean;
  className?: string;
}) {
  const pill = useId();
  return (
    <div
      role="group"
      aria-label={label}
      className={cx(
        'inline-flex max-w-full gap-0.5 rounded-[9px] border border-line p-0.5',
        wrap ? 'flex-wrap' : 'overflow-x-auto [scrollbar-width:none]',
        className,
      )}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className="relative h-7 shrink-0 rounded-[7px] px-2.5 font-mono text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {on && (
              <motion.span
                layoutId={pill}
                transition={softSpring}
                className="absolute inset-0 rounded-[7px] bg-fg/[0.09]"
              />
            )}
            <motion.span
              className="relative"
              initial={false}
              animate={{ opacity: on ? 1 : 0.5 }}
              whileHover={{ opacity: on ? 1 : 0.8 }}
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
