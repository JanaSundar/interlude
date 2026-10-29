import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useId, useRef, useState } from 'react';
import { Collapsible } from '../primitives/collapsible';
import { cx } from '../primitives/cx';
import { Icon } from '../primitives/icons';
import { LiveRegion } from '../primitives/live-region';
import { Pressable } from '../primitives/pressable';
import { PresenceSlot } from '../primitives/presence-slot';
import { fade, spring, useReducedPreference, type ReducedMotion } from '../primitives/motion';
import { focusRing, surface, themeVars } from '../primitives/tokens';
import { decisionCopy, riskCopy, type ApprovalStatus, type Risk } from './decision';
import { AutoHeight } from '../primitives/auto-size';

export type ApprovalGateProps = {
  /** What the agent wants to do, in plain words. */
  title: string;
  description?: string;
  /** The exact command, request or change. Shown verbatim as text. */
  action?: string;
  details?: { label: string; value: string }[];
  risk?: Risk;
  /**
   * Owned by your app. The gate never marks itself approved: it shows
   * "approved" only after your runtime confirms and you pass it here.
   */
  status: ApprovalStatus;
  onApprove: () => void | Promise<void>;
  onReject: (reason?: string) => void | Promise<void>;
  approveLabel?: string;
  rejectLabel?: string;
  accent?: string;
  reducedMotion?: ReducedMotion;
  className?: string;
};

/**
 * A request for explicit human approval. Visual only: authorisation must
 * still be enforced by your server or agent runtime.
 */
export function ApprovalGate({
  title,
  description,
  action,
  details,
  risk = 'medium',
  status,
  onApprove,
  onReject,
  approveLabel = 'Approve',
  rejectLabel = 'Reject',
  accent,
  reducedMotion,
  className,
}: ApprovalGateProps) {
  const reduced = useReducedPreference(reducedMotion);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const decidedHere = useRef(false);
  const reasonId = useId();
  const pending = status === 'pending';
  const busy = sending || status === 'submitting';
  const copy = decisionCopy[sending ? 'submitting' : status];

  // When a decision made here lands, move focus to the outcome so the
  // buttons disappearing never drop keyboard focus to the page.
  const focusOutcome = (el: HTMLElement | null) => {
    if (el && decidedHere.current) el.focus({ preventScroll: true });
  };

  const run = async (fn: () => void | Promise<void>) => {
    decidedHere.current = true;
    setSending(true);
    try {
      await fn();
    } finally {
      setSending(false);
    }
  };

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <section
        aria-label={`Approval needed: ${title}`}
        data-status={status}
        style={themeVars(accent)}
        className={cx(surface, 'overflow-hidden', className)}
      >
        <LiveRegion message={copy.announce} />
        <div className="flex gap-3 px-4 pt-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-current/[0.06]">
            <Icon name="shield" className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold tracking-tight">{title}</h3>
              <span
                className={cx(
                  'rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase',
                  riskCopy[risk].className,
                )}
              >
                {riskCopy[risk].label}
              </span>
            </div>
            {description && <p className="mt-1 text-[13px] opacity-65">{description}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-3 px-4 py-3">
          {action && (
            <pre className="overflow-x-auto rounded-[8px] bg-current/[0.05] p-2.5 font-mono text-[12px] whitespace-pre-wrap break-all">
              {action}
            </pre>
          )}
          {details && details.length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
              {details.map((d, i) => (
                <div key={i} className="contents">
                  <dt className="opacity-50">{d.label}</dt>
                  <dd className="min-w-0 break-words">{d.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <AutoHeight>
          <AnimatePresence mode="popLayout" initial={false}>
            {pending || status === 'submitting' ? (
              <PresenceSlot
                key="ask"
                exit={{ opacity: 0 }}
                transition={fade}
                className="block border-t border-current/[0.07] px-4 py-3"
              >
                <Collapsible open={rejecting}>
                  <label htmlFor={reasonId} className="mb-1 block text-xs opacity-60">
                    Reason (optional, sent to the agent)
                  </label>
                  <textarea
                    id={reasonId}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className={cx(
                      'mb-3 w-full resize-none rounded-[8px] border border-current/15 bg-transparent px-2.5 py-2 text-[13px]',
                      focusRing,
                    )}
                  />
                </Collapsible>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <AnimatePresence initial={false}>
                    {busy && (
                      <motion.span
                        key="busy"
                        className="mr-auto text-xs"
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 0.55, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={fade}
                      >
                        {copy.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <GateButton
                    label={rejecting ? 'Send rejection' : rejectLabel}
                    disabled={busy}
                    onClick={() =>
                      rejecting
                        ? void run(() => onReject(reason.trim() || undefined))
                        : setRejecting(true)
                    }
                  />
                  {rejecting ? (
                    <GateButton label="Back" disabled={busy} onClick={() => setRejecting(false)} />
                  ) : (
                    <GateButton
                      primary
                      label={approveLabel}
                      disabled={busy}
                      onClick={() => void run(onApprove)}
                    />
                  )}
                </div>
              </PresenceSlot>
            ) : (
              <motion.p
                key="outcome"
                ref={focusOutcome}
                tabIndex={-1}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                className={cx(
                  'flex items-center gap-2 border-t border-current/[0.07] px-4 py-3 text-[13px] outline-none',
                  copy.className,
                )}
              >
                <Icon name={copy.icon} />
                {copy.label}
              </motion.p>
            )}
          </AnimatePresence>
        </AutoHeight>
      </section>
    </MotionConfig>
  );
}

function GateButton({
  label,
  onClick,
  disabled,
  primary = false,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onClick={onClick}
      solid={primary}
      tint={{ rest: 6, hover: 10, press: 14 }}
      className={cx(
        'min-h-8 rounded-full px-3.5 text-xs font-medium disabled:opacity-50',
        primary && 'bg-(--il-accent) text-white',
      )}
    >
      {label}
    </Pressable>
  );
}
