import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Collapsible, useDisclosure } from '../primitives/collapsible';
import { cx } from '../primitives/cx';
import { Icon, type IconName } from '../primitives/icons';
import { LiveRegion } from '../primitives/live-region';
import { Pressable } from '../primitives/pressable';
import { fade, softSpring, useReducedPreference, type ReducedMotion } from '../primitives/motion';
import { StatusIcon } from '../primitives/status-icon';
import { surface, themeVars } from '../primitives/tokens';
import {
  describeChange,
  durationOf,
  foldActivity,
  formatDuration,
  summarize,
  type ActivityItem,
  type ActivityKind,
} from './events';
import { AutoHeight } from '../primitives/auto-size';
import { PresenceSlot } from '../primitives/presence-slot';

export type AgentActivityProps = {
  /** The raw event log as received. Duplicates and out-of-order updates are handled. */
  events: readonly unknown[];
  title?: string;
  /** compact hides details and timings. */
  variant?: 'detailed' | 'compact';
  accent?: string;
  reducedMotion?: ReducedMotion;
  className?: string;
};

const kindIcons: Record<ActivityKind, IconName> = {
  search: 'search',
  read: 'file',
  tool: 'tool',
  approval: 'shield',
  process: 'spark',
  message: 'dot',
  complete: 'check',
};

/** A chronological, truthful list of what the agent has actually reported doing. */
export function AgentActivity({
  events,
  title = 'Activity',
  variant = 'detailed',
  accent,
  reducedMotion,
  className,
}: AgentActivityProps) {
  const items = useMemo(() => foldActivity(events), [events]);
  const summary = summarize(items);
  const reduced = useReducedPreference(reducedMotion);
  const announcement = useChangeAnnouncement(items);

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <section
        aria-label={title}
        style={themeVars(accent)}
        className={cx(surface, 'p-1.5', className)}
      >
        <LiveRegion message={announcement} />
        <header className="flex items-center justify-between gap-3 px-2.5 pt-1.5 pb-2">
          <h3 className="text-[13px] font-medium">{title}</h3>
          <AnimatePresence mode="popLayout" initial={false}>
            {summary.total > 0 && (
              <motion.span
                key={`${summary.done}/${summary.total}/${summary.failed}`}
                className="font-mono text-[11px] whitespace-nowrap tabular-nums"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 0.55, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={fade}
              >
                {summary.done}/{summary.total} done
                {summary.failed > 0 && ` · ${summary.failed} failed`}
              </motion.span>
            )}
          </AnimatePresence>
        </header>
        <AutoHeight>
          <AnimatePresence mode="popLayout" initial={false}>
            {items.length === 0 ? (
              <PresenceSlot
                key="empty"
                block
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={fade}
                className="px-2.5 pb-2 text-[13px]"
              >
                No activity reported yet.
              </PresenceSlot>
            ) : (
              <PresenceSlot key="list" block transition={fade}>
                <ol className="flex flex-col">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <Row key={item.id} item={item} compact={variant === 'compact'} />
                    ))}
                  </AnimatePresence>
                </ol>
              </PresenceSlot>
            )}
          </AnimatePresence>
        </AutoHeight>
      </section>
    </MotionConfig>
  );
}

function Row({ item, compact }: { item: ActivityItem; compact: boolean }) {
  const { open, panelId, triggerProps } = useDisclosure();
  const expandable = !compact && !!item.detail;
  const ms = durationOf(item);
  const body = (
    <>
      <StatusIcon status={item.status} />
      <span className="flex min-w-0 flex-1 items-baseline gap-2">
        {item.kind && (
          <Icon
            name={kindIcons[item.kind]}
            className="size-3.5 shrink-0 translate-y-0.5 opacity-45"
          />
        )}
        <span className={cx('truncate', item.status === 'cancelled' && 'line-through opacity-60')}>
          {item.title}
        </span>
        {item.target && (
          <span className="truncate font-mono text-[11px] opacity-50">{item.target}</span>
        )}
      </span>
      <span className="sr-only">, {item.status}</span>
      {!compact && ms !== null && (
        <span className="shrink-0 font-mono text-[11px] tabular-nums opacity-45">
          {formatDuration(ms)}
        </span>
      )}
      {expandable && (
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={softSpring}
          className="shrink-0 opacity-45"
        >
          <Icon name="chevron" className="size-3" />
        </motion.span>
      )}
    </>
  );
  const rowClass =
    'flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-1.5 text-left text-[13px]';
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={softSpring}
      data-status={item.status}
    >
      {expandable ? (
        <Pressable
          {...triggerProps}
          pressScale={1}
          tint={{ hover: 4, press: 7 }}
          className={rowClass}
        >
          {body}
        </Pressable>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
      {expandable && (
        <Collapsible open={open} id={panelId}>
          <p className="mx-2.5 mb-2 ml-9 border-l border-current/10 pl-3 text-[12.5px] leading-relaxed whitespace-pre-wrap opacity-70">
            {item.detail}
          </p>
        </Collapsible>
      )}
    </motion.li>
  );
}

/** Announces step starts and endings only, never every re-render. */
function useChangeAnnouncement(items: ActivityItem[]) {
  const previous = useRef<ActivityItem[]>(items);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const change = describeChange(previous.current, items);
    previous.current = items;
    if (change) setMessage(change);
  }, [items]);
  return message;
}
