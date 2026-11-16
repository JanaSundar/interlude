import { describe, expect, it } from 'vite-plus/test';
import { catalog } from '@registry/catalog';
import { ripplePattern } from '@registry/components/interlude/dot-matrix-loader/pattern';
import { patternDots } from './art';
import { OG_DOCS, OG_HOME, ogNames } from './names';
import { ogSpec } from './spec';
import { isTemplate, templateFor, templates } from './templates';

describe('ogSpec', () => {
  it('has a card for the home page, the docs and every component', () => {
    expect(ogNames()).toEqual([OG_HOME, OG_DOCS, ...catalog.map((e) => e.slug)]);
    for (const name of ogNames()) expect(ogSpec(name), name).not.toBeNull();
  });

  it('describes a component with its own name, group and install command', () => {
    const spec = ogSpec('snake')!;
    expect(spec.title).toBe('Snake');
    expect(spec.eyebrow).toContain('Playable');
    expect(spec.command).toBe('pnpm dlx shadcn@latest add JanaSundar/interlude/snake');
    expect(spec.art).toBeDefined();
  });

  it('has no card for an unknown name', () => {
    expect(ogSpec('nope')).toBeNull();
    expect(ogSpec('')).toBeNull();
  });
});

describe('templateFor', () => {
  const pick = (name: string) => templateFor(name, ogSpec(name)!);

  it('gives each kind of page its own design', () => {
    expect(pick(OG_HOME)).toBe('poster');
    expect(pick(OG_DOCS)).toBe('terminal');
    expect(pick('snake')).toBe('arcade');
    expect(pick('agent-activity')).toBe('bento');
    expect(pick('skeleton')).toBe('bento');
  });

  it('only picks designs that exist', () => {
    for (const name of ogNames()) expect(isTemplate(pick(name)), name).toBe(true);
    expect(Object.keys(templates)).toContain('classic');
    expect(isTemplate('nope')).toBe(false);
    expect(isTemplate('toString')).toBe(false);
  });
});

describe('patternDots', () => {
  it('lays one dot per cell inside the box', () => {
    const dots = patternDots(ripplePattern, 300);
    expect(dots).toHaveLength(ripplePattern.cols * ripplePattern.rows);
    for (const d of dots) {
      expect(d.x).toBeGreaterThan(0);
      expect(d.x).toBeLessThan(300);
      expect(d.y).toBeGreaterThan(0);
      expect(d.y).toBeLessThan(300);
    }
  });

  it('centres a pattern that is wider than it is tall', () => {
    const wide = { cols: 6, rows: 3, period: 1, frame: () => ({ o: 1 }) };
    const ys = patternDots(wide, 300).map((d) => d.y);
    expect(Math.min(...ys) + Math.max(...ys)).toBeCloseTo(300);
  });
});
