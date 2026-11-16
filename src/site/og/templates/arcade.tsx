import { ACCENT, DotArt, fit, H, Mark, MONO, SANS, W, type OgTemplate } from './shared';

const INK = '#17120c';
const CREAM = '#fff4e6';
const SCREEN = 380;

const chip = (text: string, filled = false) => (
  <div
    style={{
      padding: '9px 18px',
      borderRadius: 999,
      border: `2px solid ${INK}`,
      background: filled ? INK : 'transparent',
      color: filled ? ACCENT : INK,
      fontFamily: MONO,
      fontSize: 17,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
    }}
  >
    {text}
  </div>
);

/** Arcade cabinet: full-bleed orange, a tilted screen, hard shadows and chips. */
export const Arcade: OgTemplate = ({ spec }) => {
  const headline = spec.muted ? `${spec.title} ${spec.muted}` : spec.title;
  const size = fit(headline, 132, 9, 78);
  return (
    <div
      style={{
        width: W,
        height: H,
        display: 'flex',
        position: 'relative',
        background: ACCENT,
        color: INK,
        fontFamily: SANS,
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
        <DotArt spec={spec} size={SCREEN - 96} color={ACCENT} floor={0.1} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 68,
          top: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <Mark ink={INK} signal={CREAM} height={30} />
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6 }}>interlude</div>
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
        <div style={{ display: 'flex', gap: 10 }}>
          {chip(spec.tag, true)}
          {spec.tagline && chip(spec.tagline)}
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
          <span>{spec.title}</span>
          {spec.muted && <span style={{ color: CREAM }}>{spec.muted}</span>}
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 29,
            lineHeight: 1.3,
            color: 'rgba(23,18,12,0.78)',
            lineClamp: 3,
          }}
        >
          {spec.description}
        </div>
      </div>

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
          fontFamily: MONO,
          fontSize: 19,
        }}
      >
        <span style={{ color: ACCENT }}>$</span>
        <span>{spec.command}</span>
      </div>
    </div>
  );
};
