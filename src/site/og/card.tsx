import { ACCENT, mark } from '../logo';
import { OG_SIZE } from '../meta';
import { patternDots } from './art';
import type { OgSpec } from './spec';

const { width: OG_WIDTH, height: OG_HEIGHT } = OG_SIZE;

const INK = '#f4f4f5';
const BG = '#0e0f11';
const GRID = 'rgba(255,255,255,0.22)';
const MUTED = 'rgba(255,255,255,0.62)';
const FAINT = 'rgba(255,255,255,0.38)';
const ART = 300;

const dotsX = (top: number) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top,
      height: 1,
      backgroundImage: `linear-gradient(to right, ${GRID} 50%, transparent 50%)`,
      backgroundSize: '6px 1px',
    }}
  />
);

const dotsY = (left: number) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left,
      width: 1,
      backgroundImage: `linear-gradient(to bottom, ${GRID} 50%, transparent 50%)`,
      backgroundSize: '1px 6px',
    }}
  />
);

/** The dot animation, frozen on one frame, in a bordered panel. */
function Art({ spec }: { spec: OgSpec & { art: NonNullable<OgSpec['art']> } }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 96,
        top: 150,
        width: ART + 40,
        height: ART + 40,
        display: 'flex',
        borderRadius: 28,
        border: `1px solid ${GRID}`,
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <div style={{ position: 'relative', display: 'flex', width: ART, height: ART, margin: 20 }}>
        {patternDots(spec.art, ART).map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: d.x - d.r,
              top: d.y - d.r,
              width: d.r * 2,
              height: d.r * 2,
              borderRadius: d.r,
              background: ACCENT,
              opacity: d.o,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Pure: the Open Graph card for a spec. Flex-only layout, which is what Takumi renders. */
export function OgCard({ spec }: { spec: OgSpec }) {
  const textWidth = spec.art ? 640 : 1000;
  const titleSize = spec.art ? 84 : 96;
  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: 'flex',
        position: 'relative',
        background: BG,
        color: INK,
        fontFamily: 'Inter Tight',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -180,
          top: -220,
          width: 720,
          height: 720,
          borderRadius: 360,
          backgroundImage:
            'radial-gradient(circle closest-side, rgba(240,163,94,0.16), rgba(240,163,94,0))',
        }}
      />
      {dotsX(48)}
      {dotsX(OG_HEIGHT - 48)}
      {dotsY(48)}
      {dotsY(OG_WIDTH - 48)}

      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 76,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <svg viewBox={mark.viewBox} width={64} height={34}>
          <g
            fill="none"
            stroke={INK}
            strokeWidth={mark.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={mark.stem} />
            <path d={mark.wave} />
          </g>
          <circle cx={mark.dot.cx} cy={mark.dot.cy} r={mark.dot.r} fill={INK} />
          <circle cx={mark.signal.cx} cy={mark.signal.cy} r={mark.signal.r} fill={ACCENT} />
        </svg>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.6 }}>interlude</div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 84,
          fontFamily: 'JetBrains Mono',
          fontSize: 15,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        {spec.eyebrow}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 168,
          width: textWidth,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: titleSize * 0.26,
            fontSize: titleSize,
            lineHeight: 1,
            fontWeight: 600,
            letterSpacing: -titleSize * 0.044,
          }}
        >
          <span>{spec.title}</span>
          {spec.muted && <span style={{ color: FAINT }}>{spec.muted}</span>}
        </div>
        <div style={{ fontSize: 30, fontWeight: 400, lineHeight: 1.35, color: MUTED }}>
          {spec.description}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 96,
          bottom: 88,
          display: 'flex',
          gap: 12,
          fontFamily: 'JetBrains Mono',
          fontSize: 20,
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        <span style={{ color: ACCENT }}>$</span>
        <span>{spec.command}</span>
      </div>
      {spec.art ? (
        <Art spec={{ ...spec, art: spec.art }} />
      ) : (
        <div
          style={{
            position: 'absolute',
            right: 96,
            bottom: 92,
            width: 14,
            height: 14,
            borderRadius: 7,
            background: ACCENT,
          }}
        />
      )}
    </div>
  );
}
