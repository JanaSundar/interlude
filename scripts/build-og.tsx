/**
 * Renders public/og.png (1200×630), the social card shared by every page,
 * with Takumi's ImageResponse. Run with `pnpm og` after changing copy or brand.
 */
import { writeFile } from 'node:fs/promises';
import { ImageResponse } from 'takumi-js/response';
import { ACCENT, mark } from '../src/site/logo';

const W = 1200;
const H = 630;
const INK = '#f4f4f5';
const BG = '#0e0f11';
const GRID = 'rgba(255,255,255,0.22)';
const MUTED = 'rgba(255,255,255,0.62)';
const FAINT = 'rgba(255,255,255,0.38)';

/** Google Fonts serves static TTFs when no browser user agent is sent. */
async function googleFont(family: string, weight: number) {
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}`,
    )
  ).text();
  const url = /src: url\((.+?)\) format/.exec(css)?.[1];
  if (!url) throw new Error(`No font file found for ${family} ${weight}`);
  return { name: family, weight, data: await (await fetch(url)).arrayBuffer() };
}

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

const card = (
  <div
    style={{
      width: W,
      height: H,
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
    {dotsX(H - 48)}
    {dotsY(48)}
    {dotsY(W - 48)}

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
      Open-source React registry
    </div>

    <div
      style={{
        position: 'absolute',
        left: 96,
        top: 168,
        display: 'flex',
        flexDirection: 'column',
        fontSize: 108,
        lineHeight: 0.98,
        fontWeight: 600,
        letterSpacing: -4.8,
      }}
    >
      <div>Components</div>
      <div style={{ display: 'flex', gap: 28 }}>
        <span>for the</span>
        <span style={{ color: FAINT }}>in-between.</span>
      </div>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 96,
        top: 396,
        width: 760,
        fontSize: 30,
        fontWeight: 400,
        lineHeight: 1.35,
        color: MUTED,
      }}
    >
      Loaders that wait honestly, with games inside, and AI components that show what an agent
      actually did.
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
      <span>pnpm dlx shadcn@latest add JanaSundar/interlude/&lt;item&gt;</span>
    </div>
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
  </div>
);

const fonts = await Promise.all([
  googleFont('Inter Tight', 400),
  googleFont('Inter Tight', 600),
  googleFont('JetBrains Mono', 400),
]);
const image = new ImageResponse(card, { width: W, height: H, format: 'png', fonts });
await writeFile('public/og.png', Buffer.from(await image.arrayBuffer()));
console.log('wrote public/og.png');
