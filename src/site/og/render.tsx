import { ImageResponse } from 'takumi-js/response';
import inter400 from './fonts/inter-tight-400.ttf?inline';
import inter600 from './fonts/inter-tight-600.ttf?inline';
import mono400 from './fonts/jetbrains-mono-400.ttf?inline';
import { OG_SIZE } from '../meta';
import { OgCard } from './card';
import type { OgSpec } from './spec';

/** Pure: the bytes inside a `data:` URL, as an ArrayBuffer for Takumi. */
const bytes = (dataUrl: string): ArrayBuffer => {
  const b = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
};

const fonts = [
  { name: 'Inter Tight', weight: 400, data: bytes(inter400) },
  { name: 'Inter Tight', weight: 600, data: bytes(inter600) },
  { name: 'JetBrains Mono', weight: 400, data: bytes(mono400) },
];

/** Renders a card as a PNG response. The fonts ship with the app, so it never touches the network. */
export const renderOg = (spec: OgSpec) =>
  new ImageResponse(<OgCard spec={spec} />, {
    ...OG_SIZE,
    format: 'png',
    fonts,
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  });
