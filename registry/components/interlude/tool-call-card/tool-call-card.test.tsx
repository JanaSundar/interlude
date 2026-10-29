import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vite-plus/test';
import { ToolCallCard } from './tool-call-card';

describe('<ToolCallCard>', () => {
  it('shows the reported status in words, not only colour', () => {
    const { rerender } = render(<ToolCallCard name="search_docs" status="running" />);
    expect(screen.getAllByText('Running').length).toBeGreaterThan(0);
    rerender(<ToolCallCard name="search_docs" status="completed" durationMs={1234} />);
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
    expect(screen.getByText('1.2s')).toBeTruthy();
  });

  it('redacts secrets in arguments when expanded', async () => {
    render(
      <ToolCallCard
        name="http_get"
        status="completed"
        args={{ url: 'https://api.dev', headers: { Authorization: 'Bearer abc' } }}
        result={{ ok: true }}
      />,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: /http_get/ }));
    expect(screen.getByText(/https:\/\/api\.dev/)).toBeTruthy();
    expect(document.body.textContent).not.toContain('Bearer abc');
  });

  it('shows the error instead of a result on failure', () => {
    render(
      <ToolCallCard
        name="x"
        status="failed"
        result={{ ok: true }}
        error="Timeout after 30s"
        defaultOpen
      />,
    );
    expect(screen.getByText('Timeout after 30s')).toBeTruthy();
    expect(screen.queryByText(/"ok"/)).toBeNull();
  });

  it('is not expandable when there is nothing to show', () => {
    render(<ToolCallCard name="ping" status="pending" />);
    expect(screen.getByRole('button', { name: /ping/ }).hasAttribute('disabled')).toBe(true);
  });
});
