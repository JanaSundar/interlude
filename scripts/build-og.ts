/**
 * Writes every Open Graph card into the static build (dist/client/og/*.png).
 *
 * The cards are drawn by the same Takumi renderer that serves /og/<name>.png
 * in development; nothing is checked in. Pre-rendering can't be used for this
 * because it reads responses as text, which corrupts a PNG, so the build runs
 * this after `vp build`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer } from 'vite';

const root = process.cwd();
const out = join(root, 'dist', 'client', 'og');

const server = await createServer({
  configFile: false,
  root,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
  resolve: { alias: { '@': join(root, 'src'), '@registry': join(root, 'registry') } },
});

try {
  const { ogNames } = await server.ssrLoadModule('/src/site/og/names.ts');
  const { ogSpec } = await server.ssrLoadModule('/src/site/og/spec.ts');
  const { renderOg } = await server.ssrLoadModule('/src/site/og/render.tsx');

  await mkdir(out, { recursive: true });
  const names: string[] = ogNames();
  for (const name of names) {
    const image = renderOg(ogSpec(name));
    await writeFile(join(out, `${name}.png`), Buffer.from(await image.arrayBuffer()));
  }
  console.log(`og: wrote ${names.length} cards to dist/client/og`);
} finally {
  await server.close();
}
