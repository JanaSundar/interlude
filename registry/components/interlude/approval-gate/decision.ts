import type { IconName } from '../primitives/icons';

/** Host-owned decision state. Only your runtime moves it past "submitting". */
export type ApprovalStatus =
  | 'pending'
  | 'submitting'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'failed';
export type Risk = 'low' | 'medium' | 'high';

export const riskCopy: Record<Risk, { label: string; className: string }> = {
  low: { label: 'low risk', className: 'bg-current/[0.06] opacity-70' },
  medium: { label: 'review', className: 'bg-(--il-warning)/15 text-(color:--il-warning)' },
  high: { label: 'high risk', className: 'bg-(--il-danger)/15 text-(color:--il-danger)' },
};

export const decisionCopy: Record<
  ApprovalStatus,
  { label: string; announce: string; icon: IconName; className: string }
> = {
  pending: {
    label: 'Waiting for your decision',
    announce: 'Approval needed',
    icon: 'pause',
    className: '',
  },
  submitting: {
    label: 'Sending your decision…',
    announce: 'Sending decision',
    icon: 'dot',
    className: '',
  },
  approved: {
    label: 'Approved',
    announce: 'Approved',
    icon: 'check',
    className: 'text-(color:--il-success)',
  },
  rejected: {
    label: 'Rejected',
    announce: 'Rejected',
    icon: 'x',
    className: 'opacity-70',
  },
  expired: {
    label: 'Expired without a decision',
    announce: 'Approval expired',
    icon: 'minus',
    className: 'opacity-60',
  },
  failed: {
    label: 'Your decision could not be recorded',
    announce: 'Decision failed',
    icon: 'alert',
    className: 'text-(color:--il-danger)',
  },
};
