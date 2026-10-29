import { motion, useMotionTemplate, useSpring, useTransform } from 'motion/react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { spring } from '@registry/components/interlude/primitives/motion';

/** Progressive resistance past an edge: the further you pull, the less it follows. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/** Nearest step inside [min, max], free of floating-point noise. */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  const snapped = min + Math.round((value - min) / step) * step;
  return Number(Math.min(max, Math.max(min, snapped)).toFixed(6));
}

/** Critically damped: follows without overshoot. */
const settle = { stiffness: 380, damping: 39 };
const TAP_SLOP = 4;

/**
 * A flat, Control Center-style slider: one wide pill with the label and
 * value inside. Dragging is relative and tracks 1:1 from where you grab,
 * the pill rubber-bands past its ends, and the fill springs onto the nearest
 * step on release. A tap jumps to that point. A visually hidden native range
 * keeps keyboard and assistive-tech behaviour.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  format = String,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const span = max - min;
  const fraction = useSpring((value - min) / span, settle);
  const stretch = useSpring(0, { stiffness: 500, damping: 32 });
  const [origin, setOrigin] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; from: number; width: number; moved: boolean } | null>(null);

  // Follow outside changes (keyboard, reset) unless a drag owns the value.
  useEffect(() => {
    if (!drag.current) fraction.set((value - min) / span);
  }, [value, min, span, fraction]);

  const percent = useTransform(fraction, (f) => f * 100);
  const fill = useMotionTemplate`${percent}%`;
  const scaleX = useTransform(stretch, (px) => 1 + Math.abs(px) / (drag.current?.width ?? 240));

  const emit = (f: number) => {
    const next = snapToStep(min + f * span, min, max, step);
    if (next !== value) onChange(next);
    return next;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const width = e.currentTarget.getBoundingClientRect().width;
    drag.current = { x: e.clientX, from: fraction.get(), width, moved: false };
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > TAP_SLOP) d.moved = true;
    if (!d.moved) return;
    const raw = d.from + dx / d.width;
    const clamped = Math.min(1, Math.max(0, raw));
    fraction.jump(clamped);
    const over = (raw - clamped) * d.width;
    if (over !== 0) setOrigin(over > 0 ? 0 : 1);
    stretch.jump(rubberband(over, d.width));
    emit(clamped);
  };

  /** Settles the gesture. Only a real release counts as a tap; a lost or cancelled pointer just lets go. */
  const end = (e: PointerEvent<HTMLDivElement>, released: boolean) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    setDragging(false);
    stretch.set(0);
    const tapped = released && !d.moved;
    const target = tapped
      ? (e.clientX - e.currentTarget.getBoundingClientRect().left) / d.width
      : fraction.get();
    const snapped = emit(Math.min(1, Math.max(0, target)));
    fraction.set((snapped - min) / span);
  };

  return (
    <div className="relative">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="peer sr-only"
      />
      <motion.div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => end(e, true)}
        onPointerCancel={(e) => end(e, false)}
        // Capture can be lost without a pointerup (window blur, element swap):
        // never leave the control stuck mid-gesture.
        onLostPointerCapture={(e) => end(e, false)}
        animate={{ scaleY: dragging ? 1.08 : 1 }}
        transition={spring}
        style={{ scaleX, originX: origin }}
        className="relative h-9 cursor-ew-resize touch-none overflow-hidden rounded-[10px] bg-fg/[0.07] select-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent"
      >
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent/25"
          style={{ width: fill }}
          animate={{ opacity: dragging ? 1 : 0.85 }}
          transition={spring}
        />
        <div className="pointer-events-none relative flex h-full items-center justify-between px-3.5 text-[13px]">
          <span className="text-fg/85">{label}</span>
          <span className="font-mono text-[12px] text-muted tabular-nums">{format(value)}</span>
        </div>
      </motion.div>
    </div>
  );
}
