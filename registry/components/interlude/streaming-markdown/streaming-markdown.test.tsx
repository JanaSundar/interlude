import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import { parseInline, parseMarkdown } from './parse';
import { StreamingMarkdown } from './streaming-markdown';

describe('parseMarkdown', () => {
  it('parses headings, lists, quotes, rules and paragraphs', () => {
    const blocks = parseMarkdown(
      '# Title\n\nSome text\nwraps here.\n\n- a\n- b\n1. one\n> quoted\n---',
    );
    expect(blocks.map((b) => b.type)).toEqual([
      'heading',
      'paragraph',
      'list',
      'list',
      'quote',
      'rule',
    ]);
    expect(blocks[1]).toEqual({
      type: 'paragraph',
      inline: [{ type: 'text', text: 'Some text wraps here.' }],
    });
  });

  it('keeps an unterminated fence open while streaming', () => {
    const blocks = parseMarkdown('```ts\nconst a = 1;');
    expect(blocks).toEqual([{ type: 'code', lang: 'ts', text: 'const a = 1;', open: true }]);
    expect(parseMarkdown('```\nx\n```')[0]).toMatchObject({ open: false });
  });

  it('leaves half-written inline markers as literal text', () => {
    expect(parseInline('a **bold')).toEqual([{ type: 'text', text: 'a **bold' }]);
  });

  it('does not treat snake_case as emphasis', () => {
    expect(parseInline('use snake_case_name')).toEqual([
      { type: 'text', text: 'use snake_case_name' },
    ]);
    expect(parseInline('_yes_')).toEqual([
      { type: 'em', children: [{ type: 'text', text: 'yes' }] },
    ]);
  });

  it('drops unsafe link targets but keeps the label', () => {
    expect(parseInline('[click](javascript:alert(1))')[0]).toMatchObject({
      type: 'link',
      href: null,
    });
    expect(parseInline('[ok](https://a.dev)')[0]).toMatchObject({ href: 'https://a.dev/' });
  });
});

describe('<StreamingMarkdown>', () => {
  it('shows raw HTML as text', () => {
    render(<StreamingMarkdown content={'<script>alert(1)</script> and <b>bold</b>'} />);
    expect(screen.getByText('<script>alert(1)</script> and <b>bold</b>')).toBeTruthy();
    expect(document.querySelector('script, b')).toBeNull();
  });

  it('marks itself busy while streaming and announces only the end', () => {
    const { container, rerender } = render(<StreamingMarkdown content="Hel" streaming />);
    expect(container.firstElementChild!.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByRole('status').textContent).toBe('');
    rerender(<StreamingMarkdown content="Hello" streaming />);
    expect(screen.getByRole('status').textContent).toBe('');
    rerender(<StreamingMarkdown content="Hello" />);
    expect(screen.getByRole('status').textContent).toBe('Response complete');
  });

  it('labels a stopped response as incomplete', () => {
    const { rerender } = render(<StreamingMarkdown content="Hal" streaming />);
    rerender(<StreamingMarkdown content="Hal" stopped />);
    expect(screen.getByRole('status').textContent).toBe('Response stopped');
    expect(screen.getByText('Response stopped before it finished.')).toBeTruthy();
  });
});
