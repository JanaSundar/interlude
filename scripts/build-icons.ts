/** Writes the favicon and app icons from the single mark definition in src/site/logo.tsx. */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { markSvg } from '../src/site/logo';

const pub = join(import.meta.dirname, '..', 'public');
writeFileSync(join(pub, 'logo.svg'), markSvg());
writeFileSync(join(pub, 'favicon.svg'), markSvg({ ink: '#F2F2F3', bg: '#16171B' }));
writeFileSync(join(pub, 'app-icon-dark.svg'), markSvg({ ink: '#F2F2F3', bg: '#0E0F12' }));
console.log('icons written');
