import type { ReactElement } from 'react';
import { ripplePattern } from '@registry/components/interlude/dot-matrix-loader/pattern';
import { ACCENT, mark } from '../../logo';
import { OG_SIZE } from '../../meta';
import { patternDots } from '../art';
import type { OgSpec } from '../spec';

export { ACCENT };
export const { width: W, height: H } = OG_SIZE;
export const SANS = 'Inter Tight';
export const MONO = 'JetBrains Mono';

/** A card design. Flex and absolute layout only, which is what Takumi renders. */
export type OgTemplate = (props: { spec: OgSpec }) => ReactElement;

/** Pure: a type size that shrinks as the text grows, so long titles still fit their box. */
export const fit = (text: string, max: number, comfortable: number, min = max * 0.5) =>
  Math.round(Math.max(min, Math.min(max, (max * comfortable) / Math.max(text.length, 1))));

/** The Interlude mark, in any ink. */
export function Mark({
  ink,
  signal = ACCENT,
  height = 34,
}: {
  ink: string;
  signal?: string;
  height?: number;
}) {
  return (
    <svg viewBox={mark.viewBox} width={(height * 136) / 72} height={height}>
      <g
        fill="none"
        stroke={ink}
        strokeWidth={mark.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={mark.stem} />
        <path d={mark.wave} />
      </g>
      <circle cx={mark.dot.cx} cy={mark.dot.cy} r={mark.dot.r} fill={ink} />
      <circle cx={mark.signal.cx} cy={mark.signal.cy} r={mark.signal.r} fill={signal} />
    </svg>
  );
}

/**
 * The component's dot animation frozen on one frame, in a `size` box. Cards
 * without their own animation get the ripple. `square` draws pixels, not dots.
 */
export function DotArt({
  spec,
  size,
  color,
  square = false,
  floor = 0,
}: {
  spec: OgSpec;
  size: number;
  color: string;
  square?: boolean;
  /** Lowest opacity a dot is drawn at, so the resting grid stays visible. */
  floor?: number;
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', width: size, height: size }}>
      {patternDots(spec.art ?? ripplePattern, size).map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: d.x - d.r,
            top: d.y - d.r,
            width: d.r * 2,
            height: d.r * 2,
            borderRadius: square ? d.r * 0.25 : d.r,
            background: color,
            opacity: Math.max(floor, d.o),
          }}
        />
      ))}
    </div>
  );
}
