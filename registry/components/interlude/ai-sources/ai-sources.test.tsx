import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import { Citation, SourceList, SourcesProvider } from './ai-sources';
import { resolveSources } from './sources';

describe('resolveSources', () => {
  it('numbers valid sources, drops invalid and duplicate ids', () => {
    const out = resolveSources([
      { id: 'a', title: 'A', url: 'https://www.example.com/x' },
      { id: 'a', title: 'dup' },
      { title: 'no id' },
      null,
      { id: 'b', url: 'javascript:alert(1)' },
    ]);
    expect(out.map((s) => [s.id, s.n])).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
    expect(out[0]).toMatchObject({ href: 'https://www.example.com/x', host: 'example.com' });
    expect(out[1]).toMatchObject({ href: null, host: null, label: 'Untitled source' });
  });

  it('never links an unavailable source', () => {
    const [s] = resolveSources([{ id: 'a', url: 'https://a.dev', unavailable: true }]);
    expect(s?.href).toBeNull();
  });
});

describe('<SourcesProvider>', () => {
  const sources = [
    { id: 'a', title: 'Spec', url: 'https://a.dev', excerpt: 'quoted' },
    { id: 'b', title: 'Offline doc', unavailable: true },
  ];

  it('links citations to their source and flags unknown citations', () => {
    render(
      <SourcesProvider sources={sources}>
        <p>
          Claim <Citation id="a" /> and <Citation id="zzz" />
        </p>
        <SourceList />
      </SourcesProvider>,
    );
    const ref = screen.getByRole('link', { name: 'Source 1: Spec' });
    const target = document.getElementById(ref.getAttribute('href')!.slice(1));
    expect(target?.textContent).toContain('Spec');
    expect(screen.getByText('[?]')).toBeTruthy();
    expect(screen.getByText('unavailable')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /offline doc/i })).toBeNull();
  });

  it('opens external links safely', () => {
    render(
      <SourcesProvider sources={sources}>
        <SourceList />
      </SourcesProvider>,
    );
    const link = screen.getByRole('link', { name: /spec/i });
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.getAttribute('target')).toBe('_blank');
  });
});
