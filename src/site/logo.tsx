/**
 * The Interlude mark, defined once: an "i" whose stem flows into a wave and
 * lands on a signal dot. Used by the wordmark and by build-icons.
 */
export const mark = {
  dot: { cx: 8, cy: 8, r: 8 },
  stem: 'M7 27.3V65.9',
  wave: 'M7 62.5C18.5 58.5 26.5 48.5 32.5 38.2C37.2 30.5 42.7 28 49.5 28C57.5 28 61.7 34 67.2 44.2C72.7 54.5 78.5 59.8 87.2 59.8C97.2 59.8 105.2 53 114.7 39.7',
  signal: { cx: 120, cy: 30.4, r: 12 },
  stroke: 11,
  /** Tight box around the artwork, for inline use. */
  viewBox: '-2 -2 136 72',
  /** Square, centred box with breathing room, for app icons. */
  iconBox: { x: -25.5, y: -55, size: 183 },
};

export const ACCENT = '#F0A35E';

/** Pure: the mark as an SVG string, for favicons and app icons. */
export function markSvg({ ink = '#16171B', bg }: { ink?: string; bg?: string } = {}): string {
  const { x, y, size } = mark.iconBox;
  const box = bg ? `${x} ${y} ${size} ${size}` : mark.viewBox;
  const backdrop = bg
    ? `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.22}" fill="${bg}"/>`
    : '';
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}">${backdrop}`,
    `<g fill="none" stroke="${ink}" stroke-width="${mark.stroke}" stroke-linecap="round" stroke-linejoin="round">`,
    `<path d="${mark.stem}"/><path d="${mark.wave}"/></g>`,
    `<circle cx="${mark.dot.cx}" cy="${mark.dot.cy}" r="${mark.dot.r}" fill="${ink}"/>`,
    `<circle cx="${mark.signal.cx}" cy="${mark.signal.cy}" r="${mark.signal.r}" fill="${ACCENT}"/>`,
    `</svg>\n`,
  ].join('');
}

/** Inline mark, static. */
export function Logo({ className = 'h-[15px] w-auto' }: { className?: string }) {
  return (
    <svg viewBox={mark.viewBox} className={className} aria-hidden>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={mark.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={mark.stem} />
        <path d={mark.wave} />
      </g>
      <circle {...mark.dot} fill="currentColor" />
      <circle {...mark.signal} fill="var(--accent)" />
    </svg>
  );
}
