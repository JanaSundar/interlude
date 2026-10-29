import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { AutoHeight } from '@registry/components/interlude/primitives/auto-size';
import { fade } from '@registry/components/interlude/primitives/motion';
import { CommandTabs, InstallTabs } from '../code';
import type { Item } from '../items';
import { addDependencyFor } from '../meta';
import { SourceViewer } from '../source-viewer';
import { Segmented } from '../ui';

type Method = 'cli' | 'manual';

/** Folders the CLI writes for an item: its own, then the shared layers it builds on. */
export const sourceFolders = (item: Item) =>
  [item.slug, item.base === 'interlude-core' ? 'core' : null, 'primitives'].filter(
    (f): f is string => !!f,
  );

/** CLI or manual installation, the way shadcn's component pages offer both. */
export function InstallSection({ item }: { item: Item }) {
  const [method, setMethod] = useState<Method>('cli');
  const folders = sourceFolders(item);
  return (
    <div className="flex flex-col gap-4 text-sm leading-normal text-fg">
      <Segmented<Method>
        label="Installation method"
        value={method}
        onChange={setMethod}
        className="self-start"
        options={[
          { value: 'cli', label: 'CLI' },
          { value: 'manual', label: 'Manual' },
        ]}
      />
      <AutoHeight>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={method}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            {method === 'cli' ? (
              <InstallTabs item={item.slug} />
            ) : (
              <ol className="flex flex-col gap-6">
                <Step n={1} title="Install the dependency">
                  <CommandTabs command={(pm) => addDependencyFor(pm, 'motion')} />
                </Step>
                <Step n={2} title="Copy the source into your project">
                  <p>
                    Place these files under <code>components/interlude/</code>, keeping the folder
                    names: <code>{folders.join('/, ')}/</code>.
                  </p>
                  <SourceViewer folders={folders} />
                </Step>
                <Step n={3} title="Check the import path">
                  <p>
                    Files import each other relatively, so only the line that imports the component
                    needs to match your alias, e.g.{' '}
                    <code>
                      @/components/interlude/{item.slug}/{item.slug}
                    </code>
                    .
                  </p>
                </Step>
              </ol>
            )}
          </motion.div>
        </AnimatePresence>
      </AutoHeight>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[1.75rem_1fr] gap-x-3">
      <span
        aria-hidden
        className="grid size-7 place-items-center rounded-full border border-line font-mono text-[11px] text-muted"
      >
        {n}
      </span>
      <div className="flex min-w-0 flex-col gap-3">
        <p className="pt-1 font-medium">{title}</p>
        <div className="flex flex-col gap-3 text-muted [&_p>code]:rounded-[4px] [&_p>code]:bg-fg/[0.06] [&_p>code]:px-1 [&_p>code]:text-[0.85em] [&_p>code]:text-fg">
          {children}
        </div>
      </div>
    </li>
  );
}
