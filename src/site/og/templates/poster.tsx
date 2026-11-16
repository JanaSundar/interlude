import { ACCENT, DotArt, fit, H, Mark, MONO, SANS, W, type OgTemplate } from './shared';

const PAPER = '#f1ede4';
const INK = '#141518';
const SOFT = 'rgba(20,21,24,0.62)';
const PAD = 64;
const DISC = 430;

/** Editorial poster: warm paper, one oversized headline, a single orange disc. */
export const Poster: OgTemplate = ({ spec }) => {
  const headline = spec.muted ? `${spec.title} ${spec.muted}` : spec.title;
  const size = fit(headline, 172, 11, 96);
  return (
    <div
      style={{
        width: W,
        height: H,
        display: 'flex',
        position: 'relative',
        background: PAPER,
        color: INK,
        fontFamily: SANS,
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
          background: ACCENT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DotArt spec={spec} size={DISC * 0.6} color={INK} floor={0.1} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: PAD,
          right: PAD,
          top: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <Mark ink={INK} signal={INK} height={30} />
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6 }}>interlude</div>
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
        <div
          style={{
            fontFamily: MONO,
            fontSize: 17,
            letterSpacing: 2.4,
            textTransform: 'uppercase',
          }}
        >
          {spec.eyebrow}
        </div>
        <div style={{ width: 72, height: 6, background: INK }} />
        <div style={{ fontSize: 27, lineHeight: 1.32, color: SOFT, lineClamp: 3 }}>
          {spec.description}
        </div>
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
        <span>{spec.title}</span>
        {spec.muted && <span style={{ color: '#c9682a' }}>{spec.muted}</span>}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 68,
          padding: `0 ${PAD}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: INK,
          color: PAPER,
          fontFamily: MONO,
          fontSize: 19,
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ color: ACCENT }}>$</span>
          <span>{spec.command}</span>
        </div>
        <span style={{ color: 'rgba(241,237,228,0.55)', letterSpacing: 2 }}>{spec.tag}</span>
      </div>
    </div>
  );
};
