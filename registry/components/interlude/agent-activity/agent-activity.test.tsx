import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vite-plus/test';
import { AgentActivity } from './agent-activity';
import { describeChange, durationOf, foldActivity, normalizeEvent, summarize } from './events';

describe('foldActivity', () => {
  it('merges updates for the same id and keeps first-seen order', () => {
    const rows = foldActivity([
      { id: 'a', title: 'Search docs', status: 'running' },
      { id: 'b', title: 'Read file', status: 'pending' },
      { id: 'a', title: 'Search docs', status: 'completed' },
    ]);
    expect(rows.map((r) => [r.id, r.status])).toEqual([
      ['a', 'completed'],
      ['b', 'pending'],
    ]);
  });

  it('is idempotent for duplicate deliveries', () => {
    const e = { id: 'a', title: 'Search', status: 'running', seq: 1 };
    expect(foldActivity([e, e, e])).toHaveLength(1);
  });

  it('ignores stale sequenced updates that arrive late', () => {
    const rows = foldActivity([
      { id: 'a', title: 'Search', status: 'completed', seq: 5 },
      { id: 'a', title: 'Search', status: 'running', seq: 3 },
    ]);
    expect(rows[0]!.status).toBe('completed');
  });

  it('orders rows by sequence even when delivered out of order', () => {
    const rows = foldActivity([
      { id: 'b', title: 'Second', status: 'running', seq: 2 },
      { id: 'a', title: 'First', status: 'completed', seq: 1 },
    ]);
    expect(rows.map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('never moves a settled step back to running without a sequence', () => {
    const rows = foldActivity([
      { id: 'a', title: 'Run tests', status: 'failed' },
      { id: 'a', title: 'Run tests', status: 'running' },
    ]);
    expect(rows[0]!.status).toBe('failed');
  });

  it('drops malformed events instead of inventing content', () => {
    expect(
      foldActivity([null, 'x', { id: 'a' }, { title: 'no id' }, { id: '', title: 't' }]),
    ).toEqual([]);
    expect(normalizeEvent({ id: 1, title: 'T', status: 'nonsense', kind: 'hack' })).toMatchObject({
      id: '1',
      status: 'pending',
      kind: undefined,
    });
  });

  it('summarizes and measures only what was reported', () => {
    const rows = foldActivity([
      { id: 'a', title: 'A', status: 'completed', startedAt: 1000, endedAt: 2500 },
      { id: 'b', title: 'B', status: 'running', startedAt: 2500 },
    ]);
    expect(summarize(rows)).toMatchObject({ total: 2, done: 1, failed: 0, current: { id: 'b' } });
    expect(durationOf(rows[0]!)).toBe(1500);
    expect(durationOf(rows[1]!)).toBeNull();
  });

  it('describes only starts and endings for screen readers', () => {
    const before = foldActivity([{ id: 'a', title: 'Search', status: 'running' }]);
    const same = foldActivity([{ id: 'a', title: 'Search', status: 'running', detail: 'more' }]);
    const after = foldActivity([{ id: 'a', title: 'Search', status: 'completed' }]);
    expect(describeChange(before, same)).toBe('');
    expect(describeChange(before, after)).toBe('Search: completed');
  });
});

describe('<AgentActivity>', () => {
  it('renders an honest empty state', () => {
    render(<AgentActivity events={[]} />);
    expect(screen.getByText('No activity reported yet.')).toBeTruthy();
  });

  it('renders steps with text status and expandable plain-text details', async () => {
    const user = userEvent.setup();
    render(
      <AgentActivity
        events={[
          {
            id: 'a',
            kind: 'read',
            title: 'Read config',
            status: 'completed',
            target: 'app.ts',
            detail: '<img src=x onerror=alert(1)>',
          },
          { id: 'b', title: 'Call API', status: 'failed' },
        ]}
      />,
    );
    expect(screen.getByText('1/2 done · 1 failed')).toBeTruthy();
    expect(screen.getByText(', failed')).toBeTruthy();
    const toggle = screen.getByRole('button', { name: /read config/i });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    await user.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeTruthy();
    expect(document.querySelector('img')).toBeNull();
  });

  it('announces a step finishing', () => {
    const { rerender } = render(
      <AgentActivity events={[{ id: 'a', title: 'Search', status: 'running' }]} />,
    );
    rerender(<AgentActivity events={[{ id: 'a', title: 'Search', status: 'completed' }]} />);
    expect(screen.getByRole('status').textContent).toBe('Search: completed');
  });
});
