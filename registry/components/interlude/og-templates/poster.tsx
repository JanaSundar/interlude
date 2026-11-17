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

const PAPER = '#f1ede4';
const INK = '#141518';
const SOFT = 'rgba(20,21,24,0.62)';
const PAD = 64;
const DISC = 430;

/** Editorial poster: warm paper, one oversized headline, a single orange disc. */
export const OgPoster: OgTemplate = (card) => {
  const { sans, mono } = fonts(card);
  const accent = card.accent ?? OG_ACCENT;
  const size = fit(headline(card), 172, 11, 96);
  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: PAPER,
        color: INK,
        fontFamily: sans,
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -70,
          top: 58,
          width: DISC,
          height: DISC,
          borderRadius: DISC / 2,
          background: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DotArt pattern={card.art} size={DISC * 0.6} color={INK} floor={0.1} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: PAD,
          right: PAD,
          top: 52,
          display: 'flex',
        }}
      >
        <Brand card={card} ink={INK} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: PAD,
          top: 150,
          width: 520,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {card.eyebrow && (
          <div
            style={{
              fontFamily: mono,
              fontSize: 17,
              letterSpacing: 2.4,
              textTransform: 'uppercase',
            }}
          >
            {card.eyebrow}
          </div>
        )}
        <div style={{ width: 72, height: 6, background: INK }} />
        {card.description && (
          <div style={{ fontSize: 27, lineHeight: 1.32, color: SOFT, lineClamp: 3 }}>
            {card.description}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          left: PAD - 6,
          right: PAD,
          bottom: 104,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          columnGap: size * 0.24,
          fontSize: size,
          lineHeight: 0.9,
          fontWeight: 600,
          letterSpacing: -size * 0.055,
        }}
      >
        <span>{card.title}</span>
        {card.muted && <span style={{ color: accent }}>{card.muted}</span>}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 68,
          boxSizing: 'border-box',
          whiteSpace: 'nowrap',
          padding: `0 ${PAD}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: INK,
          color: PAPER,
          fontFamily: mono,
          fontSize: 19,
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          {card.command && <span style={{ color: accent }}>$</span>}
          <span>{card.command}</span>
        </div>
        <span style={{ color: 'rgba(241,237,228,0.55)', letterSpacing: 2 }}>{card.tag}</span>
      </div>
    </div>
  );
};
