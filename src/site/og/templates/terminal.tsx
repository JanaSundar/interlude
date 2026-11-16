import { ACCENT, DotArt, fit, H, MONO, W, type OgTemplate } from './shared';

const BG = '#06070a';
const WINDOW = '#0d1016';
const LINE = 'rgba(255,255,255,0.1)';
const TEXT = '#e6e8ec';
const DIM = 'rgba(230,232,236,0.5)';
const GREEN = '#7bd88f';

const light = (color: string) => (
  <div style={{ width: 14, height: 14, borderRadius: 7, background: color }} />
);

/** A terminal session: window chrome, the install command, the title at the prompt. */
export const Terminal: OgTemplate = ({ spec }) => {
  const title = (spec.muted ? `${spec.title} ${spec.muted}` : spec.title).toLowerCase();
  const size = fit(title, 76, 13, 46);
  return (
    <div
      style={{
        width: W,
        height: H,
        display: 'flex',
        position: 'relative',
        background: BG,
        backgroundImage: `radial-gradient(circle at 50% 110%, rgba(240,163,94,0.28), rgba(240,163,94,0) 60%)`,
        color: TEXT,
        fontFamily: MONO,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 56,
          right: 56,
          top: 48,
          bottom: 48,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 18,
          border: `1px solid ${LINE}`,
          background: WINDOW,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 52,
            padding: '0 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            borderBottom: `1px solid ${LINE}`,
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          {light('#ff5f57')}
          {light('#febc2e')}
          {light('#28c840')}
          <div style={{ flexGrow: 1, textAlign: 'center', fontSize: 16, color: DIM }}>
            interlude — {spec.eyebrow.toLowerCase()}
          </div>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ flexGrow: 1, display: 'flex', padding: '34px 40px 36px' }}>
          <div
            style={{
              flexGrow: 1,
              flexBasis: 0,
              display: 'flex',
              flexDirection: 'column',
              fontSize: 19,
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', gap: 12, fontSize: 17, whiteSpace: 'nowrap' }}>
              <span style={{ color: ACCENT }}>$</span>
              <span style={{ color: TEXT }}>{spec.command}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, color: DIM, marginTop: 6 }}>
              <span style={{ color: GREEN }}>ok</span>
              <span>{(spec.tagline ?? spec.eyebrow).toLowerCase()}</span>
            </div>

            <div style={{ flexGrow: 1 }} />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: size * 0.3,
                fontSize: size,
                lineHeight: 1.1,
                letterSpacing: -size * 0.04,
              }}
            >
              <span style={{ color: ACCENT }}>&gt;</span>
              <span>{title}</span>
              <div style={{ width: size * 0.5, height: size * 0.95, background: ACCENT }} />
            </div>
            <div
              style={{
                marginTop: 22,
                display: 'flex',
                gap: 14,
                fontSize: 21,
                lineHeight: 1.45,
                color: DIM,
              }}
            >
              <span>#</span>
              <span style={{ flexGrow: 1, flexBasis: 0, lineClamp: 3 }}>{spec.description}</span>
            </div>
          </div>

          <div
            style={{
              marginLeft: 40,
              paddingLeft: 40,
              borderLeft: `1px dashed ${LINE}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
            }}
          >
            <DotArt spec={spec} size={250} color={ACCENT} square floor={0.08} />
            <div style={{ fontSize: 15, letterSpacing: 2, color: DIM }}>
              {spec.tag.toLowerCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
