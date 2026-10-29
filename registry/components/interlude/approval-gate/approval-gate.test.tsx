import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';
import { ApprovalGate } from './approval-gate';

const base = {
  title: 'Delete 3 files',
  action: 'rm build/*.log',
  onApprove: vi.fn(),
  onReject: vi.fn(),
};

describe('<ApprovalGate>', () => {
  it('does not claim approval until the host confirms it', async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    const { rerender } = render(<ApprovalGate {...base} status="pending" onApprove={onApprove} />);
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(onApprove).toHaveBeenCalledOnce();
    expect(screen.queryByText('Approved')).toBeNull();
    rerender(<ApprovalGate {...base} status="approved" onApprove={onApprove} />);
    expect(screen.getByRole('status').textContent).toBe('Approved');
    expect(document.activeElement?.textContent).toBe('Approved');
  });

  it('disables decisions while an async approval is in flight', async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onApprove = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<ApprovalGate {...base} status="pending" onApprove={onApprove} />);
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(screen.getByRole('button', { name: 'Approve' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByText('Sending your decision…')).toBeTruthy();
    await act(async () => resolve());
    expect(screen.getByRole('button', { name: 'Approve' }).hasAttribute('disabled')).toBe(false);
  });

  it('sends an optional rejection reason', async () => {
    const user = userEvent.setup();
    const onReject = vi.fn();
    render(<ApprovalGate {...base} status="pending" onReject={onReject} />);
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await user.type(screen.getByLabelText(/reason/i), 'Keep the logs');
    await user.click(screen.getByRole('button', { name: 'Send rejection' }));
    expect(onReject).toHaveBeenCalledWith('Keep the logs');
  });

  it('shows the action verbatim and reports failure honestly', () => {
    render(<ApprovalGate {...base} status="failed" />);
    expect(screen.getByText('rm build/*.log')).toBeTruthy();
    expect(screen.getByText('Your decision could not be recorded')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
