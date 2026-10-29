import { describe, expect, it } from 'vite-plus/test';
import { activeIndex, readingLine, readToc, sameToc, slugify } from './toc';

describe('slugify', () => {
  it('makes stable, URL-safe anchors', () => {
    expect(slugify('Accessibility & motion')).toBe('accessibility-and-motion');
    expect(slugify('  What gets installed? ')).toBe('what-gets-installed');
    expect(slugify('Café — déjà vu')).toBe('cafe-deja-vu');
  });
});

describe('readToc', () => {
  it('collects only opted-in h2 and h3 headings, in order', () => {
    document.body.innerHTML = `
      <article>
        <h1 id="t">Title</h1>
        <h2 id="a" data-toc="">Alpha</h2>
        <h3 id="b" data-toc="">Beta</h3>
        <h2 id="c">Not in the outline</h2>
        <h2 id="d" data-toc="Short label">A much longer heading</h2>
      </article>`;
    expect(readToc(document)).toEqual([
      { id: 'a', text: 'Alpha', level: 2 },
      { id: 'b', text: 'Beta', level: 3 },
      { id: 'd', text: 'Short label', level: 2 },
    ]);
  });
});

describe('activeIndex', () => {
  const tops = [100, 500, 900];

  it('picks the last heading that has passed the reading line', () => {
    expect(activeIndex(tops, 120)).toBe(0);
    expect(activeIndex(tops, 600)).toBe(1);
    expect(activeIndex(tops, 2000)).toBe(2);
  });

  it('defaults to the first heading before any is reached', () => {
    expect(activeIndex(tops, 10)).toBe(0);
  });

  it('handles an empty outline', () => {
    expect(activeIndex([], 0)).toBe(-1);
  });
});

describe('readingLine', () => {
  const long = { scrollable: 5000 };

  it('stays under the header until the last screenful of scroll', () => {
    expect(readingLine(112, 800, { ...long, remaining: 5000 })).toBe(112);
    expect(readingLine(112, 800, { ...long, remaining: 800 })).toBe(112);
  });

  it('slides to the bottom edge as the page ends, so late sections take turns', () => {
    expect(readingLine(112, 800, { ...long, remaining: 400 })).toBe(456);
    expect(readingLine(112, 800, { ...long, remaining: 0 })).toBe(800);
    expect(readingLine(112, 800, { ...long, remaining: -3 })).toBe(800);
  });

  it('measures the slide against the scroll a short page actually has', () => {
    expect(readingLine(112, 800, { scrollable: 300, remaining: 300 })).toBe(112);
    expect(readingLine(112, 800, { scrollable: 300, remaining: 150 })).toBe(456);
    expect(readingLine(112, 800, { scrollable: 0, remaining: 0 })).toBe(112);
  });
});

describe('sameToc', () => {
  it('compares ids and labels in order', () => {
    const a = [{ id: 'x', text: 'X', level: 2 as const }];
    expect(sameToc(a, [{ id: 'x', text: 'X', level: 2 }])).toBe(true);
    expect(sameToc(a, [{ id: 'x', text: 'Y', level: 2 }])).toBe(false);
    expect(sameToc(a, [])).toBe(false);
  });
});
