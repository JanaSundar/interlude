import { describe, expect, it } from 'vite-plus/test';
import { changed, expr, jsx, literal } from './jsx';

describe('jsx', () => {
  it('writes short elements on one line with idiomatic props', () => {
    expect(
      jsx('Loader', { status: 'loading', size: 22, hint: true, open: false, x: undefined }),
    ).toBe('<Loader status="loading" size={22} hint open={false} />');
  });

  it('uses expressions and literals where strings cannot be attributes', () => {
    expect(jsx('A', { events: expr('events'), title: 'Say "hi"', items: ['copy', 'edit'] })).toBe(
      `<A events={events} title={'Say "hi"'} items={['copy', 'edit']} />`,
    );
  });

  it('breaks long elements into one prop per line', () => {
    const out = jsx('ApprovalGate', {
      title: 'Delete three build logs from the shared runner',
      risk: 'high',
      onApprove: expr('approve'),
    });
    expect(out).toBe(
      '<ApprovalGate\n  title="Delete three build logs from the shared runner"\n  risk="high"\n  onApprove={approve}\n/>',
    );
  });

  it('indents children', () => {
    expect(jsx('P', {}, '<C />')).toBe('<P>\n  <C />\n</P>');
  });
});

describe('literal', () => {
  it('escapes quotes and nests objects', () => {
    expect(literal({ q: "it's", n: [1, true] })).toBe(`{ q: 'it\\'s', n: [1, true] }`);
  });
});

describe('changed', () => {
  it('keeps only values that differ from component defaults', () => {
    expect(changed({ speed: 1, size: 22, status: 'loading' }, { speed: 1, size: 16 })).toEqual({
      size: 22,
      status: 'loading',
    });
  });
});
