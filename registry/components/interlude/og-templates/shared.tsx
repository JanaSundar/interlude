import type { ReactElement, ReactNode } from 'react';
import type { DotPattern } from '../primitives/dot-matrix';
import { patternDots } from './dots';

/** The size link previews are drawn at. Every design is laid out for exactly this. */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_ACCENT = '#F0A35E';

export type OgCardProps = {
  title: string;
  /** A second run of the title in a quieter or accent colour. */
  muted?: string;
  description?: string;
  /** A short line above or beside the title, e.g. "Documentation". */
  eyebrow?: string;
  /** One word for the kind of page. */
  tag?: string;
  /** A few words; shown where a design has a spare corner. */
  tagline?: string;
  /** A shell command, shown in monospace. */
  command?: string;
  /** Your product's name, next to the logo. */
  brand?: string;
  /** Your logo, about 30px tall, drawn in the ink colour the design passes in. */
  logo?: (ink: string) => ReactNode;
  /** A dot pattern, frozen on one frame. Defaults to a diagonal ripple. */
  art?: DotPattern;
  /** Any CSS colour. The arcade design fills the card with it, so keep it light there. */
  accent?: string;
  /** Font family names, as registered with your renderer. */
  sans?: string;
  mono?: string;
};

/** A card design: static JSX with inline flex and absolute layout, no hooks. */
export type OgTemplate = (props: OgCardProps) => ReactElement;

export const fonts = (p: OgCardProps) => ({
  sans: p.sans ?? 'Inter Tight',
  mono: p.mono ?? 'JetBrains Mono',
});

/** Pure: the whole headline, for sizing. */
export const headline = (p: OgCardProps) => (p.muted ? `${p.title} ${p.muted}` : p.title);

/** Pure: a type size that shrinks as the text grows, so long titles still fit their box. */
export const fit = (text: string, max: number, comfortable: number, min = max * 0.5) =>
  Math.round(Math.max(min, Math.min(max, (max * comfortable) / Math.max(text.length, 1))));

/** A still diagonal ripple on a 3×3 grid, for cards without art of their own. */
const ripple: DotPattern = {
  cols: 3,
  rows: 3,
  period: 1,
  frame: (_phase, col, row) => {
    const v = 1 - Math.abs(col + row - 2) / 2;
    return { o: 0.25 + 0.75 * v, s: 0.8 + 0.25 * v };
  },
};

/** Logo and product name in a row; renders nothing when neither is given. */
export function Brand({ card, ink, size = 28 }: { card: OgCardProps; ink: string; size?: number }) {
  if (!card.logo && !card.brand) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.5 }}>
      {card.logo?.(ink)}
      {card.brand && (
        <div style={{ fontSize: size, fontWeight: 600, letterSpacing: -size * 0.02 }}>
          {card.brand}
        </div>
      )}
    </div>
  );
}

/** The dot pattern frozen on one frame, in a `size` box. `square` draws pixels, not dots. */
export function DotArt({
  pattern = ripple,
  size,
  color,
  square = false,
  floor = 0,
}: {
  pattern?: DotPattern;
  size: number;
  color: string;
  square?: boolean;
  /** Lowest opacity a dot is drawn at, so the resting grid stays visible. */
  floor?: number;
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', width: size, height: size }}>
      {patternDots(pattern, size).map((d, i) => (
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
