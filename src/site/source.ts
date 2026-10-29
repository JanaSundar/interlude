/**
 * Real source of the registry files, loaded on demand so the detail pages
 * show exactly what `shadcn add` installs.
 */
const sources = import.meta.glob<string>(
  [
    '/registry/components/interlude/**/*.{ts,tsx}',
    '!/registry/components/interlude/**/*.test.{ts,tsx}',
  ],
  { query: '?raw', import: 'default' },
);

export type SourceFile = { path: string; code: string };

const ROOT = '/registry/components/interlude/';

export async function loadSources(folders: string[]): Promise<SourceFile[]> {
  // The item's own folder first, then its shared layers, in the order given.
  const rank = (p: string) => folders.findIndex((f) => p.startsWith(`${ROOT}${f}/`));
  const paths = Object.keys(sources)
    .filter((p) => rank(p) >= 0)
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  return Promise.all(
    paths.map(async (p) => ({
      path: `components/interlude/${p.slice(ROOT.length)}`,
      code: await sources[p]!(),
    })),
  );
}
