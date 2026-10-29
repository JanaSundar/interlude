import { describe, expect, it } from 'vite-plus/test';
import { navSection } from '../chrome';
import { items } from '../items';
import { COMPONENTS_KEY, componentKey, docEntries, docKeyFor, neighbours, pageKey } from './order';
import { docPages } from './pages';

describe('docs reading order', () => {
  it('lists every guide, the overview and every component exactly once', () => {
    const keys = docEntries.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toHaveLength(docPages.length + 1 + items.length);
    expect(keys.slice(0, docPages.length)).toEqual(docPages.map((p) => pageKey(p.slug)));
    expect(keys[docPages.length]).toBe(COMPONENTS_KEY);
  });

  it('chains from the last guide into the components', () => {
    const lastGuide = pageKey(docPages.at(-1)!.slug);
    expect(neighbours(lastGuide).next?.key).toBe(COMPONENTS_KEY);
    const firstComponent = docEntries[docPages.length + 1]!;
    expect(neighbours(COMPONENTS_KEY).next?.key).toBe(firstComponent.key);
    expect(neighbours(firstComponent.key).prev?.key).toBe(COMPONENTS_KEY);
  });

  it('has no neighbours beyond the ends or for unknown keys', () => {
    expect(neighbours(pageKey(docPages[0]!.slug)).prev).toBeUndefined();
    expect(neighbours(docEntries.at(-1)!.key).next).toBeUndefined();
    expect(neighbours(componentKey('nope'))).toEqual({});
  });
});

describe('navSection', () => {
  it('treats components as their own section inside the docs', () => {
    expect(navSection('/docs/components')).toBe('/docs/components');
    expect(navSection('/docs/components/snake')).toBe('/docs/components');
    expect(navSection('/docs')).toBe('/docs');
    expect(navSection('/docs/theming')).toBe('/docs');
    expect(navSection('/')).toBeNull();
  });
});

describe('docKeyFor', () => {
  it('maps pathnames to entries', () => {
    expect(docKeyFor('/docs')).toBe(docEntries[0]!.key);
    expect(docKeyFor('/docs/')).toBe(docEntries[0]!.key);
    expect(docKeyFor('/docs/installation')).toBe(pageKey('installation'));
    expect(docKeyFor('/docs/components')).toBe(COMPONENTS_KEY);
    expect(docKeyFor('/docs/components/snake/')).toBe(componentKey('snake'));
  });
});
