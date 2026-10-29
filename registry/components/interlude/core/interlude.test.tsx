import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';
import { MemoryMatchLoader } from '../memory-match/memory-match';
import { SnakeLoader } from '../snake/snake';

const loaderButton = () => screen.getByRole('button', { name: /play snake while you wait/i });
const stage = () => screen.getByRole('group', { name: /^snake\./i });

describe('Interlude shell', () => {
  it('renders nothing while idle and the loader while loading', () => {
    const { container, rerender } = render(<SnakeLoader active={false} />);
    expect(container.querySelector('[data-interlude]')).toBeNull();
    rerender(<SnakeLoader active label="Generating" />);
    expect(loaderButton()).toBeTruthy();
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('opens the game on click and focuses it; Escape returns to the loader', async () => {
    const user = userEvent.setup();
    render(<SnakeLoader status="loading" label="Generating" seed={1} />);
    await user.click(loaderButton());
    expect(document.activeElement).toBe(stage());
    expect(document.querySelector('[data-interlude]')!.getAttribute('data-game')).toBe('playing');
    await user.keyboard('{Escape}');
    expect(document.querySelector('[data-interlude]')!.getAttribute('data-game')).toBe('hidden');
  });

  it('opens from the keyboard', async () => {
    const user = userEvent.setup();
    render(<SnakeLoader status="loading" />);
    await user.tab();
    expect(document.activeElement).toBe(loaderButton());
    await user.keyboard('{Enter}');
    expect(document.querySelector('[data-game="playing"]')).not.toBeNull();
  });

  it.each(['success', 'error', 'cancelled'] as const)(
    'task %s replaces the game immediately',
    async (status) => {
      const user = userEvent.setup();
      const { rerender } = render(
        <SnakeLoader status="loading" result={(s) => <p>result:{s}</p>} />,
      );
      await user.click(loaderButton());
      rerender(<SnakeLoader status={status} result={(s) => <p>result:{s}</p>} />);
      expect(screen.getByText(`result:${status}`)).toBeTruthy();
      expect(document.querySelector('[data-interlude]')!.getAttribute('data-game')).toBe('hidden');
    },
  );

  it('never reopens a game when a new task starts', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SnakeLoader status="loading" />);
    await user.click(loaderButton());
    rerender(<SnakeLoader status="success" />);
    rerender(<SnakeLoader status="loading" />);
    expect(document.querySelector('[data-interlude]')!.getAttribute('data-game')).toBe('hidden');
  });

  it('cannot be discovered once the task has finished', () => {
    render(<SnakeLoader status="success" discovered />);
    expect(screen.queryByRole('group')).toBeNull();
    // Once visibly, once in the live region.
    expect(screen.getAllByText('Done')).toHaveLength(2);
  });

  it('pauses a real-time game when focus leaves, and keeps outside keys outside', async () => {
    const user = userEvent.setup();
    render(
      <>
        <SnakeLoader status="loading" />
        <input aria-label="composer" />
      </>,
    );
    await user.click(loaderButton());
    const input = screen.getByLabelText('composer');
    await user.click(input);
    expect(document.querySelector('[data-game="paused"]')).not.toBeNull();
    await user.keyboard('{ArrowUp}hello');
    expect((input as HTMLInputElement).value).toBe('hello');
  });

  it('respects controlled discovery without stealing focus', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MemoryMatchLoader status="loading" discovered={false} onDiscoveredChange={onChange} />,
    );
    rerender(<MemoryMatchLoader status="loading" discovered onDiscoveredChange={onChange} />);
    expect(screen.getByRole('group', { name: /memory match/i })).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
  });

  it('plays a turn-based game through clicks', async () => {
    const user = userEvent.setup();
    render(<MemoryMatchLoader status="loading" seed={9} />);
    await user.click(screen.getByRole('button', { name: /play memory match/i }));
    const cards = screen.getAllByRole('button', { name: /face down/i });
    expect(cards).toHaveLength(12);
    await user.click(cards[0]!);
    expect(screen.getByText('moves').nextSibling?.textContent).toBe('0');
  });

  it('cleans up timers and frames on unmount', async () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    const caf = vi.spyOn(window, 'cancelAnimationFrame');
    const user = userEvent.setup();
    const { unmount } = render(<SnakeLoader status="loading" />);
    await user.click(loaderButton());
    act(() => {
      fireEvent.keyDown(stage(), { key: 'ArrowUp' });
    });
    unmount();
    if (raf.mock.calls.length) expect(caf).toHaveBeenCalled();
    raf.mockRestore();
    caf.mockRestore();
  });
});
