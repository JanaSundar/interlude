import { cx } from '../primitives/cx';
import { Icon, type IconName } from '../primitives/icons';
import type { Block } from './card';

const calloutStyle: Record<'info' | 'warning' | 'success', { icon: IconName; className: string }> =
  {
    info: { icon: 'spark', className: 'text-(color:--il-accent)' },
    warning: { icon: 'alert', className: 'text-(color:--il-warning)' },
    success: { icon: 'check', className: 'text-(color:--il-success)' },
  };

/** Renders one validated block. Every value reaches the DOM as a text node. */
export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return <p className="leading-relaxed opacity-80">{block.text}</p>;
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        <List
          className={cx(
            'flex flex-col gap-1 pl-5 opacity-80',
            block.ordered ? 'list-decimal' : 'list-disc',
          )}
        >
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </List>
      );
    }
    case 'fields':
      return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
          {block.fields.map((f, i) => (
            <div key={i} className="contents">
              <dt className="opacity-50">{f.label}</dt>
              <dd className="min-w-0 break-words">{f.value}</dd>
            </div>
          ))}
        </dl>
      );
    case 'metric':
      return (
        <div>
          <p className="text-[11px] tracking-wide uppercase opacity-50">{block.label}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{block.value}</p>
          {block.note && <p className="text-xs opacity-55">{block.note}</p>}
        </div>
      );
    case 'steps':
      return (
        <ol className="flex flex-col gap-2">
          {block.steps.map((s, i) => (
            <li key={i} className="flex gap-2.5">
              <span
                className={cx(
                  'mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border font-mono text-[9px]',
                  s.done
                    ? 'border-transparent bg-(--il-success) text-white'
                    : 'border-current/25 opacity-70',
                )}
              >
                {s.done ? <Icon name="check" className="size-2.5" /> : i + 1}
              </span>
              <span>
                <span className={cx(s.done && 'opacity-60')}>{s.title}</span>
                {s.done && <span className="sr-only"> (done)</span>}
                {s.detail && <span className="block text-xs opacity-55">{s.detail}</span>}
              </span>
            </li>
          ))}
        </ol>
      );
    case 'comparison':
      return (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-current/10">
                <th className="px-1 py-1.5 font-normal opacity-50">
                  <span className="sr-only">Item</span>
                </th>
                {block.columns.map((c, i) => (
                  <th key={i} scope="col" className="px-1 py-1.5 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i} className="border-b border-current/[0.06] last:border-0">
                  <th scope="row" className="px-1 py-1.5 font-normal opacity-55">
                    {r.label}
                  </th>
                  {r.values.map((v, j) => (
                    <td key={j} className="px-1 py-1.5">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'callout': {
      const style = calloutStyle[block.tone];
      return (
        <p className="flex gap-2 rounded-[10px] bg-current/[0.04] px-3 py-2">
          <span className={cx('mt-0.5 shrink-0', style.className)}>
            <Icon name={style.icon} />
          </span>
          <span className="opacity-80">{block.text}</span>
        </p>
      );
    }
  }
}
