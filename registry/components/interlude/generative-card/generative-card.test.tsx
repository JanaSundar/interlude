import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';
import { parseCard } from './card';
import { GenerativeCard } from './generative-card';

const valid = {
  kind: 'recommendation',
  title: 'Use the smaller plan',
  blocks: [
    { type: 'text', text: 'Usage fits comfortably.' },
    { type: 'metric', label: 'Monthly', value: 12 },
    {
      type: 'comparison',
      columns: ['Small', 'Large'],
      rows: [{ label: 'Price', values: ['$12'] }],
    },
  ],
  actions: [{ id: 'choose', label: 'Choose small' }],
};

describe('parseCard', () => {
  it('accepts a valid spec, including from a JSON string', () => {
    const { card, issues } = parseCard(JSON.stringify(valid));
    expect(issues).toEqual([]);
    expect(card?.blocks).toHaveLength(3);
    expect(card?.blocks[1]).toEqual({
      type: 'metric',
      label: 'Monthly',
      value: '12',
      note: undefined,
    });
  });

  it('pads short comparison rows instead of shifting cells', () => {
    const block = parseCard(valid).card?.blocks[2];
    expect(block).toMatchObject({ rows: [{ label: 'Price', values: ['$12', '—'] }] });
  });

  it('skips unknown or incomplete blocks and reports them', () => {
    const { card, issues } = parseCard({
      title: 'T',
      blocks: [
        { type: 'html', html: '<script>x</script>' },
        { type: 'list', items: [] },
        { type: 'text', text: 'ok' },
      ],
    });
    expect(card?.blocks).toEqual([{ type: 'text', text: 'ok' }]);
    expect(issues).toHaveLength(2);
  });

  it('returns null for invalid JSON, missing title or nothing renderable', () => {
    expect(parseCard('{nope').card).toBeNull();
    expect(parseCard({ blocks: [{ type: 'text', text: 'x' }] }).card).toBeNull();
    expect(parseCard({ title: 'T', blocks: [] }).card).toBeNull();
    expect(parseCard(null).card).toBeNull();
  });

  it('falls back to a neutral kind and default tone', () => {
    const { card } = parseCard({
      kind: 'evil',
      title: 'T',
      blocks: [{ type: 'callout', tone: 'x', text: 'hi' }],
    });
    expect(card?.kind).toBe('info');
    expect(card?.blocks[0]).toMatchObject({ tone: 'info' });
  });
});

describe('<GenerativeCard>', () => {
  it('renders model text as text, never as markup', () => {
    render(
      <GenerativeCard
        spec={{ title: 'T', blocks: [{ type: 'text', text: '<img src=x onerror=alert(1)>' }] }}
      />,
    );
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeTruthy();
    expect(document.querySelector('img')).toBeNull();
  });

  it('calls back with the action id and runs nothing itself', async () => {
    const onAction = vi.fn();
    render(<GenerativeCard spec={valid} onAction={onAction} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Choose small' }));
    expect(onAction).toHaveBeenCalledWith('choose');
  });

  it('hides actions while streaming and shows nothing for an incomplete stream', () => {
    const { container, rerender } = render(<GenerativeCard spec="{" streaming />);
    expect(container.innerHTML).toBe('');
    rerender(<GenerativeCard spec={valid} streaming />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('article').getAttribute('aria-busy')).toBe('true');
  });

  it('explains why a finished result could not be shown', () => {
    render(<GenerativeCard spec={{ title: 'T', blocks: [] }} />);
    expect(screen.getByText('This result couldn’t be displayed')).toBeTruthy();
    expect(screen.getByText('No renderable blocks.')).toBeTruthy();
  });
});
