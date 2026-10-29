import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';
import { ResponseActions } from './response-actions';

const mockClipboard = (writeText: (t: string) => Promise<void>) =>
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

describe('<ResponseActions>', () => {
  it('reports "Copied" only after the clipboard write succeeds', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    render(<ResponseActions actions={['copy']} copyText="hello" />);
    mockClipboard(writeText);
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(screen.getByRole('status').textContent).toBe('Copied');
  });

  it('reports a failed copy instead of pretending', async () => {
    const user = userEvent.setup();
    render(<ResponseActions actions={['copy']} copyText="hello" />);
    mockClipboard(() => Promise.reject(new Error('denied')));
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    expect(screen.getByRole('status').textContent).toBe('Copy failed');
  });

  it('calls back with ids and moves focus with arrow keys', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <ResponseActions
        actions={['regenerate', { id: 'share', label: 'Share', icon: 'link' }, 'edit']}
        onAction={onAction}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Regenerate' }));
    expect(onAction).toHaveBeenCalledWith('regenerate');
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Share' }));
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Edit' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Regenerate' }));
  });
});
