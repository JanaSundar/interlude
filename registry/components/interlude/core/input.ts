import { createContext, useContext, useEffect, useRef, type PointerEvent } from 'react';

export type Direction = 'up' | 'down' | 'left' | 'right';

const keyDirections: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
};

export function directionFromKey(key: string): Direction | undefined {
  return keyDirections[key];
}

export const opposite: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export const delta: Record<Direction, readonly [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

/** Return true when the key was consumed so the shell can preventDefault. */
export type KeyHandler = (event: { key: string; type: 'down' | 'up' }) => boolean;

/**
 * Keys are delivered by the focused stage only — never from window — so a
 * game can't steal input from a chat composer or form elsewhere on the page.
 */
export const StageKeysContext = createContext<{ current: KeyHandler | null } | null>(null);

export function useStageKeys(handler: KeyHandler) {
  const slot = useContext(StageKeysContext);
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => {
    if (!slot) return;
    const fn: KeyHandler = (event) => latest.current(event);
    slot.current = fn;
    return () => {
      if (slot.current === fn) slot.current = null;
    };
  }, [slot]);
}

export function swipeDirection(dx: number, dy: number, threshold = 18): Direction | undefined {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return undefined;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

/** Pointer handlers for swipe and tap gestures (touch, pen or mouse). */
export function useSwipe(onSwipe: (dir: Direction) => void, onTap?: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: PointerEvent) => {
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: PointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dir = swipeDirection(e.clientX - s.x, e.clientY - s.y);
      if (dir) onSwipe(dir);
      else onTap?.();
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
}

/** Map a pointer position to logical board coordinates. */
export function pointerToBoard(e: PointerEvent, width: number, height: number) {
  const rect = e.currentTarget.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * width,
    y: ((e.clientY - rect.top) / rect.height) * height,
  };
}

/**
 * Tracks which of `keys` are held down, for continuous movement. Cleared on
 * pause so a key released while unfocused never sticks. `onPress` handles
 * one-shot keys (fire, restart) and returns true when it consumed the key.
 */
export function useHeldKeys(
  keys: readonly string[],
  paused: boolean,
  onPress?: (key: string) => boolean,
) {
  const held = useRef(new Set<string>());
  useEffect(() => {
    if (paused) held.current.clear();
  }, [paused]);
  useStageKeys(({ key, type }) => {
    if (type === 'down' && onPress?.(key)) return true;
    if (!keys.includes(key)) return false;
    if (type === 'down') held.current.add(key);
    else held.current.delete(key);
    return true;
  });
  return held;
}

/** -1, 0 or 1 from two groups of held keys. */
export function axis(
  held: Set<string>,
  negative: readonly string[],
  positive: readonly string[],
): -1 | 0 | 1 {
  const neg = negative.some((k) => held.has(k));
  const pos = positive.some((k) => held.has(k));
  return neg === pos ? 0 : neg ? -1 : 1;
}

/**
 * Drag-to-steer: the pressed pointer position in board units, else null.
 * Presses on a button inside the board (a restart overlay) are left alone, or
 * capturing the pointer would swallow the button's click.
 */
export function usePointerTarget(width: number, height: number, onPress?: () => void) {
  const target = useRef<{ x: number; y: number } | null>(null);
  const handlers = {
    onPointerDown: (e: PointerEvent) => {
      if ((e.target as Element).closest('button')) return;
      onPress?.();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      target.current = pointerToBoard(e, width, height);
    },
    onPointerMove: (e: PointerEvent) => {
      if (target.current) target.current = pointerToBoard(e, width, height);
    },
    onPointerUp: () => {
      target.current = null;
    },
    onPointerCancel: () => {
      target.current = null;
    },
  };
  return { target, handlers };
}
