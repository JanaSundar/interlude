import type { CSSProperties } from 'react';
import {
  Brand,
  DotArt,
  fit,
  fonts,
  headline,
  OG_ACCENT,
  OG_HEIGHT,
  OG_WIDTH,
  type OgTemplate,
} from './shared';

const BG = '#e9e9ec';
const TILE = '#ffffff';
const INK = '#111214';
const SOFT = 'rgba(17,18,20,0.6)';
const DARK = '#15161a';
const GAP = 16;
const PAD = 40;
const SIDE = 318;

const tile: CSSProperties = {
  display: 'flex',
  boxSizing: 'border-box',
  borderRadius: 30,
  background: TILE,
};

/** Bento grid: the card split into rounded tiles, each holding one fact. */
export const OgBento: OgTemplate = (card) => {
  const { sans, mono } = fonts(card);
  const accent = card.accent ?? OG_ACCENT;
  const size = fit(headline(card), 104, 12, 68);
  const corner = card.tagline ?? card.eyebrow;
  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        boxSizing: 'border-box',
        padding: PAD,
        display: 'flex',
        gap: GAP,
        background: BG,
        color: INK,
        fontFamily: sans,
      }}
    >
      <div
        style={{
          flexGrow: 1,
          flexBasis: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: GAP,
        }}
      >
        <div
          style={{
            ...tile,
            flexGrow: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '36px 40px 38px',
          }}
        >
          <div style={{ display: 'flex', minHeight: 30 }}>
            <Brand card={card} ink={INK} size={25} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                columnGap: size * 0.24,
                fontSize: size,
                lineHeight: 0.96,
                fontWeight: 600,
                letterSpacing: -size * 0.048,
              }}
            >
              <span>{card.title}</span>
              {card.muted && <span style={{ color: 'rgba(17,18,20,0.35)' }}>{card.muted}</span>}
            </div>
            {card.description && (
              <div style={{ fontSize: 25, lineHeight: 1.35, color: SOFT, lineClamp: 3 }}>
                {card.description}
              </div>
            )}
          </div>
        </div>

        {card.command && (
          <div
            style={{
              ...tile,
              height: 84,
              flexShrink: 0,
              padding: '0 32px',
              alignItems: 'center',
              gap: 12,
              background: DARK,
              color: '#f4f4f5',
              fontFamily: mono,
              fontSize: 17,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: accent }}>$</span>
            <span>{card.command}</span>
          </div>
        )}
      </div>

      <div
        style={{ width: SIDE, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: GAP }}
      >
        <div
          style={{
            ...tile,
            height: SIDE,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            background: accent,
          }}
        >
          <DotArt pattern={card.art} size={SIDE - 92} color={INK} floor={0.12} />
        </div>
        <div
          style={{
            ...tile,
            flexGrow: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px 28px 26px',
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 15,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: SOFT,
            }}
          >
            {card.tag}
          </div>
          {corner && (
            <div style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 600, letterSpacing: -0.9 }}>
              {corner}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
