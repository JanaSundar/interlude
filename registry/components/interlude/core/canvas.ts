import { useCallback, useLayoutEffect, useRef } from 'react';

export type Palette = { accent: string; fg: string };

/** Colors come from the component's CSS variables so themes apply to canvases too. */
export function readPalette(el: Element): Palette {
  const style = getComputedStyle(el);
  return {
    accent: style.getPropertyValue('--il-accent').trim() || '#2563eb',
    fg: style.color || '#111',
  };
}

/** Size the bitmap to the canvas's on-screen box × device pixel ratio. */
function fitBitmap(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  // Layout size, not the transformed rect: unfold animations scale the board.
  const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width === w && canvas.height === h) return;
  // Keep the last frame (scaled) so a paused board never flashes blank.
  const previous = document.createElement('canvas');
  previous.width = canvas.width;
  previous.height = canvas.height;
  previous.getContext('2d')?.drawImage(canvas, 0, 0);
  canvas.width = w;
  canvas.height = h;
  if (previous.width && previous.height) canvas.getContext('2d')?.drawImage(previous, 0, 0, w, h);
}

/**
 * A crisp canvas drawn in logical board units. The bitmap always matches the
 * displayed size at the device's pixel density, so boards never upscale.
 */
export function useCanvas(width: number, height: number) {
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    fitBitmap(canvas);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => fitBitmap(canvas));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [width, height]);

  /** Returns a cleared, scaled context plus the live palette, or null before mount. */
  const begin = useCallback(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, palette: readPalette(canvas) };
  }, [width, height]);

  /** Runs `draw` on a fresh frame; does nothing until the canvas has mounted. */
  const paint = useCallback(
    (draw: (ctx: CanvasRenderingContext2D, palette: Palette) => void) => {
      const frame = begin();
      if (frame) draw(frame.ctx, frame.palette);
    },
    [begin],
  );

  return { ref, begin, paint };
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** The faint dot field every board sits on: the loader's matrix, grown up. */
export function dotField(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  cell: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.12;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) dot(ctx, (x + 0.5) * cell, (y + 0.5) * cell, cell * 0.12);
  }
  ctx.globalAlpha = 1;
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
