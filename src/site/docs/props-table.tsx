import type { PropDoc } from '../props';

/** API reference for a component's props. */
export function PropsTable({ props }: { props: PropDoc[] }) {
  return (
    <div className="overflow-x-auto rounded-panel border border-line text-fg">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-line font-mono text-[11px] text-faint">
          <tr>
            <th className="px-4 py-2.5 font-normal">Prop</th>
            <th className="px-4 py-2.5 font-normal">Type</th>
            <th className="px-4 py-2.5 font-normal">Default</th>
            <th className="px-4 py-2.5 font-normal">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name} className="border-b border-line align-top last:border-0">
              <td className="px-4 py-2.5 font-mono text-[12.5px] text-accent">{p.name}</td>
              <td className="max-w-56 px-4 py-2.5 font-mono text-[11.5px] break-words text-muted">
                {p.type}
              </td>
              <td className="px-4 py-2.5 font-mono text-[11.5px] text-faint">{p.default ?? '—'}</td>
              <td className="px-4 py-2.5 text-muted">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
