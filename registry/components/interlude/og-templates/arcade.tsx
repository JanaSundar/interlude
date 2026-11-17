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

const INK = '#17120c';
const CREAM = '#fff4e6';
const SCREEN = 380;

/** Arcade cabinet: the accent edge to edge, a tilted screen, hard shadows and chips. */
export const OgArcade: OgTemplate = (card) => {
  const { sans, mono } = fonts(card);
  const accent = card.accent ?? OG_ACCENT;
  const size = fit(headline(card), 132, 9, 78);
  const chip = (text: string, filled = false) => (
    <div
      style={{
        padding: '9px 18px',
        borderRadius: 999,
        border: `2px solid ${INK}`,
        background: filled ? INK : 'transparent',
        color: filled ? accent : INK,
        fontFamily: mono,
        fontSize: 17,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
      }}
    >
      {text}
    </div>
  );
  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: accent,
        color: INK,
        fontFamily: sans,
      }}
    >
      {/* Halftone field behind the screen. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle, rgba(23,18,12,0.16) 3px, transparent 3.5px)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(to left, black, transparent 62%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          right: 78,
          top: 118,
          width: SCREEN,
          height: SCREEN,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 44,
          border: `4px solid ${INK}`,
          background: INK,
          boxShadow: `14px 14px 0 ${CREAM}`,
          transform: 'rotate(5deg)',
        }}
      >
        <DotArt pattern={card.art} size={SCREEN - 96} color={accent} floor={0.1} />
      </div>

      <div style={{ position: 'absolute', left: 68, top: 56, display: 'flex' }}>
        <Brand card={card} ink={INK} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 68,
          top: 148,
          width: 640,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', gap: 10, minHeight: 42 }}>
          {card.tag && chip(card.tag, true)}
          {card.tagline && chip(card.tagline)}
        </div>
        <div
          style={{
            marginTop: 30,
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: size * 0.24,
            fontSize: size,
            lineHeight: 0.92,
            fontWeight: 600,
            letterSpacing: -size * 0.05,
          }}
        >
          <span>{card.title}</span>
          {card.muted && <span style={{ color: CREAM }}>{card.muted}</span>}
        </div>
        {card.description && (
          <div
            style={{
              marginTop: 26,
              fontSize: 29,
              lineHeight: 1.3,
              color: 'rgba(23,18,12,0.78)',
              lineClamp: 3,
            }}
          >
            {card.description}
          </div>
        )}
      </div>

      {card.command && (
        <div
          style={{
            position: 'absolute',
            left: 68,
            bottom: 56,
            padding: '14px 22px',
            display: 'flex',
            gap: 12,
            borderRadius: 14,
            background: INK,
            color: CREAM,
            fontFamily: mono,
            fontSize: 19,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: accent }}>$</span>
          <span>{card.command}</span>
        </div>
      )}
    </div>
  );
};
