import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { catalog, CORE_ITEM, PRIMITIVES_ITEM, REPO } from '../registry/catalog';
import { installCommand } from './site/meta';

const root = join(import.meta.dirname, '..');
const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8')) as {
  name: string;
  homepage: string;
  items: {
    name: string;
    files: { path: string; target: string }[];
    registryDependencies?: string[];
    dependencies?: string[];
  }[];
};

describe('registry.json', () => {
  it('has the fields a GitHub registry source needs', () => {
    expect(registry.name).toBe('interlude');
    expect(REPO).toBe('JanaSundar/interlude');
    expect(registry.homepage).toBe(`https://github.com/${REPO}`);
  });

  it('lists every catalogue entry plus the shared layers', () => {
    expect(registry.items.map((i) => i.name).sort()).toEqual(
      [PRIMITIVES_ITEM, CORE_ITEM, ...catalog.map((e) => e.slug)].sort(),
    );
  });

  it('points at files that exist, with matching targets', () => {
    for (const item of registry.items) {
      expect(item.files.length).toBeGreaterThan(0);
      for (const file of item.files) {
        expect(existsSync(join(root, file.path)), file.path).toBe(true);
        expect(file.target).toBe(`@components/${file.path.replace('registry/components/', '')}`);
        expect(file.path).not.toMatch(/\.test\./);
      }
    }
  });

  it('depends on its shared layer through the GitHub address used in install commands', () => {
    const deps = (name: string) =>
      registry.items.find((i) => i.name === name)?.registryDependencies;
    expect(deps(PRIMITIVES_ITEM)).toBeUndefined();
    expect(deps(CORE_ITEM)).toEqual([`${REPO}/${PRIMITIVES_ITEM}`]);
    for (const entry of catalog) {
      expect(deps(entry.slug)).toEqual([`${REPO}/${entry.base}`]);
    }
    for (const item of registry.items) expect(item.dependencies).toEqual(['motion']);
    expect(installCommand('snake')).toBe('npx shadcn@latest add JanaSundar/interlude/snake');
  });

  it('only imports from its own folder and the layers it depends on', () => {
    const layers: Record<string, string[]> = {
      [PRIMITIVES_ITEM]: ['primitives'],
      [CORE_ITEM]: ['core', 'primitives'],
    };
    const folderOf = (name: string) =>
      name === PRIMITIVES_ITEM ? 'primitives' : name === CORE_ITEM ? 'core' : name;
    for (const item of registry.items) {
      const base = catalog.find((e) => e.slug === item.name)?.base;
      const allowed = [folderOf(item.name), ...(base ? layers[base]! : layers[item.name]!)];
      for (const file of item.files) {
        const source = readFileSync(join(root, file.path), 'utf8');
        for (const [, spec] of source.matchAll(/from '\.\.\/([^/']+)\//g))
          expect(allowed, `${file.path} imports ../${spec}`).toContain(spec);
      }
    }
  });

  it('ships only relative imports between registry files', () => {
    for (const item of registry.items) {
      for (const file of item.files) {
        const source = readFileSync(join(root, file.path), 'utf8');
        const imports = [...source.matchAll(/from '([^']+)'/g)].map((m) => m[1]!);
        for (const spec of imports)
          expect(
            spec.startsWith('.') || ['react', 'motion/react'].includes(spec),
            `${file.path}: ${spec}`,
          ).toBe(true);
      }
    }
  });
});
