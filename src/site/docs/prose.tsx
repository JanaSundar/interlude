import type { ReactNode } from 'react';
import { Icon, type IconName } from '@registry/components/interlude/primitives/icons';
import { cx } from '../ui';
import { slugify } from './toc';

/** Long-form typography for docs pages: readable measure, calm rhythm, inline code chips. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className={cx(
        'flex flex-col gap-4 text-sm leading-[1.7] text-muted sm:text-[15px]',
        // Direct children only: live component previews nested in a page must keep their own styles.
        '[&>p>code]:rounded-[4px] [&>p>code]:bg-fg/[0.06] [&>p>code]:px-1 [&>p>code]:py-px [&>p>code]:text-[0.85em] [&>p>code]:text-fg',
        '[&>ul>li>code]:rounded-[4px] [&>ul>li>code]:bg-fg/[0.06] [&>ul>li>code]:px-1 [&>ul>li>code]:text-[0.85em] [&>ul>li>code]:text-fg',
        '[&>p_strong]:font-medium [&>p_strong]:text-fg',
        '[&>ul]:flex [&>ul]:list-disc [&>ul]:flex-col [&>ul]:gap-1.5 [&>ul]:pl-5 [&>ul>li]:marker:text-faint',
      )}
    >
      {children}
    </div>
  );
}

/**
 * Section heading. Its anchor id comes from its text, and data-toc opts it
 * into the auto-generated outline, so the outline can never drift from the
 * page. `toc` sets a shorter outline label.
 */
export function H2({ children, toc }: { children: string; toc?: string }) {
  return (
    <h2
      id={slugify(children)}
      data-toc={toc ?? ''}
      className="mt-10 scroll-mt-24 border-t border-line pt-8 text-lg font-semibold sm:text-xl tracking-tight text-fg first:mt-2 first:border-t-0 first:pt-0"
    >
      {children}
    </h2>
  );
}

export function H3({ children, toc }: { children: string; toc?: string }) {
  return (
    <h3
      id={slugify(children)}
      data-toc={toc ?? ''}
      className="mt-4 scroll-mt-24 text-base font-semibold tracking-tight text-fg"
    >
      {children}
    </h3>
  );
}

const callouts: Record<'note' | 'warn', { icon: IconName; className: string }> = {
  note: { icon: 'spark', className: 'text-accent' },
  warn: { icon: 'alert', className: 'text-(--interlude-warning)' },
};

export function Callout({
  tone = 'note',
  children,
}: {
  tone?: 'note' | 'warn';
  children: ReactNode;
}) {
  const c = callouts[tone];
  return (
    <div className="flex gap-3 rounded-[12px] border border-line bg-fg/[0.025] px-4 py-3 text-[14px]">
      <span className={cx('mt-1 shrink-0', c.className)}>
        <Icon name={c.icon} />
      </span>
      <div className="text-muted [&_code]:text-fg">{children}</div>
    </div>
  );
}

/** Definition table for tokens, statuses and the like. */
export function Terms({ rows }: { rows: readonly (readonly [string, ReactNode])[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 rounded-panel border border-line p-4 text-sm">
      {rows.map(([term, description]) => (
        <div key={term} className="contents">
          <dt className="font-mono text-[12.5px] text-accent">{term}</dt>
          <dd className="text-muted">{description}</dd>
        </div>
      ))}
    </dl>
  );
}
