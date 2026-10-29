import { useEffect, useRef, type PointerEvent } from 'react';

/** Pixels the pointer must travel before a press becomes a drag rather than a click. */
const DRAG_THRESHOLD = 4;

/**
 * Makes a row with a hidden scrollbar scrollable like a normal one: the mouse
 * wheel scrolls it sideways, and a mouse can drag it. Touch already scrolls
 * natively, so only mouse presses are handled. A drag swallows the click that
 * ends it, so releasing over a tab never selects it by accident.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  // Native listener: React's onWheel is passive and can't stop the page scrolling.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const room = el.scrollWidth - el.clientWidth;
      if (room <= 0 || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const next = Math.min(room, Math.max(0, el.scrollLeft + e.deltaY));
      // Let the page take over once the row hits either end.
      if (next === el.scrollLeft) return;
      e.preventDefault();
      el.scrollLeft = next;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handlers = {
    onPointerDown: (e: PointerEvent<T>) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
    },
    onPointerMove: (e: PointerEvent<T>) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      if (!d.moved && Math.abs(dx) < DRAG_THRESHOLD) return;
      if (!d.moved) e.currentTarget.setPointerCapture(e.pointerId);
      d.moved = true;
      e.currentTarget.scrollLeft = d.left - dx;
    },
    onPointerUp: (e: PointerEvent<T>) => {
      if (drag.current?.moved) e.currentTarget.releasePointerCapture(e.pointerId);
      // Cleared after the click that follows a drag has been swallowed.
      setTimeout(() => (drag.current = null), 0);
    },
    onPointerCancel: () => {
      drag.current = null;
    },
    onClickCapture: (e: { stopPropagation: () => void; preventDefault: () => void }) => {
      if (!drag.current?.moved) return;
      e.stopPropagation();
      e.preventDefault();
    },
  };

  return { ref, handlers };
}
