/**
 * Generates registry.json from registry/catalog.ts and the files on disk, so
 * the registry can never list a file that doesn't exist (or miss one that does).
 *
 *   vpx scripts/build-registry.ts
 *
 * This is a GitHub registry: the shadcn CLI reads this file and the source
 * files from the repository directly (`npx shadcn add JanaSundar/interlude/snake`),
 * so there is no build output to host.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { catalog, CORE_ITEM, PRIMITIVES_ITEM, REPO } from '../registry/catalog';

const ROOT = join(import.meta.dirname, '..');
const SOURCE = 'registry/components/interlude';

function filesIn(folder: string) {
  return readdirSync(join(ROOT, SOURCE, folder))
    .filter((f) => /\.tsx?$/.test(f) && !f.includes('.test.'))
    .sort()
    .map((f) => {
      const path = `${SOURCE}/${folder}/${f}`;
      return {
        path,
        type: 'registry:component',
        target: `@components/${relative('registry/components', path).replaceAll('\\', '/')}`,
      };
    });
}

const dependsOn = (item: string) => [`${REPO}/${item}`];

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'interlude',
  homepage: `https://github.com/${REPO}`,
  items: [
    {
      name: PRIMITIVES_ITEM,
      type: 'registry:component',
      title: 'Interlude primitives',
      description:
        'Status vocabulary, theme tokens, motion conventions, status icons, disclosure, live region, dot matrix and safe formatting shared by every Interlude component.',
      dependencies: ['motion'],
      files: filesIn('primitives'),
    },
    {
      name: CORE_ITEM,
      type: 'registry:component',
      title: 'Interlude game core',
      description:
        'Task lifecycle, game shell, input and fixed-step loop shared by the playable loaders.',
      dependencies: ['motion'],
      registryDependencies: dependsOn(PRIMITIVES_ITEM),
      files: filesIn('core'),
    },
    ...catalog.map((entry) => ({
      name: entry.slug,
      type: 'registry:component',
      title: entry.name,
      description: entry.game
        ? `${entry.description} Click it to discover what's inside.`
        : entry.description,
      dependencies: ['motion'],
      registryDependencies: dependsOn(entry.base),
      files: filesIn(entry.slug),
      categories: [entry.group.toLowerCase(), ...(entry.genre ? [entry.genre] : [])],
      docs: entry.usage,
    })),
  ],
};

writeFileSync(join(ROOT, 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`);
console.log(`registry.json: ${registry.items.length} items`);
