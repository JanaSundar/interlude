import { motion } from 'motion/react';
import { useId, type ReactNode } from 'react';
import { Icon } from '@registry/components/interlude/primitives/icons';
import { softSpring, spring } from '@registry/components/interlude/primitives/motion';
import { Pressable } from '@registry/components/interlude/primitives/pressable';
import { cx } from '../ui';

export { Slider } from './slider';

/** A Settings-style inset group: rounded, hairline-separated rows. */
export function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section>
      {title && <h4 className="mb-1.5 px-1 text-[11px] font-medium text-faint">{title}</h4>}
      <div className="divide-y divide-line overflow-hidden rounded-[12px] bg-fg/[0.035]">
        {children}
      </div>
    </section>
  );
}

/** Label on the left, control on the right. */
export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 px-3.5 py-1.5">
      <span className="shrink-0 text-[13px] text-fg/85">{label}</span>
      {children}
    </div>
  );
}

/** Content that spans the row: sliders and segmented choices. */
export function WideRow({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 p-1.5">
      {label && <span className="px-2 pt-1 text-[13px] text-fg/85">{label}</span>}
      {children}
    </div>
  );
}

/** iOS-proportioned switch: the knob springs across and stretches while pressed. */
export function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      initial={false}
      whileTap="pressed"
      className="relative h-[22px] w-[38px] shrink-0 rounded-full bg-fg/15 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-accent"
        animate={{ opacity: checked ? 1 : 0 }}
        transition={spring}
      />
      <motion.span
        className="absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)]"
        style={{ originX: checked ? 1 : 0 }}
        animate={{ x: checked ? 16 : 0 }}
        variants={{ pressed: { scaleX: 1.2 } }}
        transition={softSpring}
      />
    </motion.button>
  );
}

export const SWATCHES = [
  { value: 'default', color: 'var(--accent)' },
  { value: '#5b8cff', color: '#5b8cff' },
  { value: '#3ecf8e', color: '#3ecf8e' },
  { value: '#e5484d', color: '#e5484d' },
  { value: '#c084fc', color: '#c084fc' },
] as const;

export function Swatches({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const ring = useId();
  return (
    <div role="group" aria-label={label} className="flex gap-1.5">
      {SWATCHES.map((s) => {
        const on = s.value === value;
        return (
          <motion.button
            key={s.value}
            type="button"
            aria-pressed={on}
            aria-label={s.value === 'default' ? 'Default accent' : s.value}
            onClick={() => onChange(s.value)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            transition={spring}
            className="relative grid size-6 place-items-center rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {on && (
              <motion.span
                layoutId={ring}
                style={{ borderRadius: 6 }}
                transition={softSpring}
                className="absolute inset-0 rounded-[6px] border-[1.5px] border-fg/70"
              />
            )}
            <span className="size-[18px] rounded-[4px]" style={{ background: s.color }} />
          </motion.button>
        );
      })}
    </div>
  );
}

/** Inline, right-aligned field in the row, like a Settings value. */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      aria-label={label}
      value={value}
      placeholder={placeholder ?? 'None'}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 min-w-0 flex-1 bg-transparent text-right text-[13px] text-muted caret-accent outline-none placeholder:text-faint focus:text-fg"
    />
  );
}

/** Equal-width segmented control with a raised thumb that glides, like UISegmentedControl. */
export function Choice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const thumb = useId();
  // Long labels get wider cells rather than being truncated.
  const longest = Math.max(...options.map((o) => o.length));
  const columns = options.length <= 3 ? options.length : longest > 8 ? 3 : 4;
  return (
    <div
      role="group"
      aria-label={label}
      className="grid gap-0.5 rounded-[9px] bg-fg/[0.06] p-0.5"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o)}
            className="relative h-7 min-w-0 rounded-[7px] px-1.5 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {on && (
              <motion.span
                layoutId={thumb}
                transition={softSpring}
                className="absolute inset-0 rounded-[7px] bg-raised shadow-[0_1px_2px_rgb(0_0_0/0.18),0_0_0_0.5px_rgb(0_0_0/0.06)] dark:bg-fg/[0.14]"
              />
            )}
            <motion.span
              className="relative block truncate"
              initial={false}
              animate={{ opacity: on ? 1 : 0.55 }}
              whileHover={{ opacity: on ? 1 : 0.85 }}
              transition={spring}
            >
              {o}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}

/** A tappable row in the accent colour, for replays and one-off events. */
export function ActionRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onClick={onPress}
      pressScale={1}
      tint={{ hover: 4, press: 8 }}
      className={cx(
        'flex min-h-11 w-full items-center justify-between px-3.5 text-[13px] text-accent',
      )}
    >
      {label}
      <Icon name="refresh" className="size-3.5 opacity-70" />
    </Pressable>
  );
}
