import type { CSSProperties } from 'react';
import { ACCENT, DotArt, fit, H, Mark, MONO, SANS, W, type OgTemplate } from './shared';

const BG = '#e9e9ec';
const TILE = '#ffffff';
const INK = '#111214';
const SOFT = 'rgba(17,18,20,0.6)';
const DARK = '#15161a';
const GAP = 16;
const PAD = 40;
const SIDE = 318;

const tile: CSSProperties = { display: 'flex', borderRadius: 30, background: TILE };
const label: CSSProperties = {
  fontFamily: MONO,
  fontSize: 15,
  letterSpacing: 1.8,
  textTransform: 'uppercase',
};

/** Bento grid: the card split into rounded tiles, each holding one fact. */
export const Bento: OgTemplate = ({ spec }) => {
  const headline = spec.muted ? `${spec.title} ${spec.muted}` : spec.title;
  const size = fit(headline, 104, 12, 68);
  return (
    <div
      style={{
        width: W,
        height: H,
        padding: PAD,
        display: 'flex',
        gap: GAP,
        background: BG,
        color: INK,
        fontFamily: SANS,
      }}
    >
      <div
        style={{ flexGrow: 1, flexBasis: 0, display: 'flex', flexDirection: 'column', gap: GAP }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Mark ink={INK} height={26} />
            <div style={{ fontSize: 25, fontWeight: 600, letterSpacing: -0.5 }}>interlude</div>
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
              <span>{spec.title}</span>
              {spec.muted && <span style={{ color: 'rgba(17,18,20,0.35)' }}>{spec.muted}</span>}
            </div>
            <div style={{ fontSize: 25, lineHeight: 1.35, color: SOFT, lineClamp: 3 }}>
              {spec.description}
            </div>
          </div>
        </div>

        <div
          style={{
            ...tile,
            height: 84,
            padding: '0 32px',
            alignItems: 'center',
            gap: 12,
            background: DARK,
            color: '#f4f4f5',
            fontFamily: MONO,
            fontSize: 17,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: ACCENT }}>$</span>
          <span>{spec.command}</span>
        </div>
      </div>

      <div style={{ width: SIDE, display: 'flex', flexDirection: 'column', gap: GAP }}>
        <div
          style={{
            ...tile,
            height: SIDE,
            alignItems: 'center',
            justifyContent: 'center',
            background: ACCENT,
          }}
        >
          <DotArt spec={spec} size={SIDE - 92} color={INK} floor={0.12} />
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
          <div style={{ ...label, color: SOFT }}>{spec.tag}</div>
          <div style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 600, letterSpacing: -0.9 }}>
            {spec.tagline ?? spec.eyebrow}
          </div>
        </div>
      </div>
    </div>
  );
};
