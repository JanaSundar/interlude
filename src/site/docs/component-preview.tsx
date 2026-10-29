import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { AutoHeight } from '@registry/components/interlude/primitives/auto-size';
import { fade } from '@registry/components/interlude/primitives/motion';
import { CodeTabs } from '../code';
import type { Item } from '../items';
import type { Values } from '../playground/playground';
import { Button, Segmented } from '../ui';

type View = 'preview' | 'code';

/**
 * A live example with a Preview / Code switch. The code is generated from
 * the same values the preview renders, so the two can never disagree.
 */
export function ComponentPreview({
  item,
  values,
  file,
}: {
  item: Item;
  values: Values;
  /** File name shown on the code tab. */
  file?: string;
}) {
  const [view, setView] = useState<View>('preview');
  const [run, setRun] = useState(0);
  const { Preview, code } = item.playground;
  return (
    <div className="overflow-hidden rounded-panel border border-line bg-raised text-sm leading-normal text-fg">
      <div className="flex h-11 items-center justify-between gap-3 border-b border-line pr-1.5 pl-2">
        <Segmented<View>
          label="Show"
          value={view}
          onChange={setView}
          options={[
            { value: 'preview', label: 'Preview' },
            { value: 'code', label: 'Code' },
          ]}
        />
        <AnimatePresence initial={false}>
          {view === 'preview' && (
            <motion.span
              key="replay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
            >
              <Button variant="ghost" size="sm" onClick={() => setRun((r) => r + 1)}>
                Replay
              </Button>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AutoHeight>
        <AnimatePresence mode="popLayout" initial={false}>
          {view === 'preview' ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
              className="stage-grid grid min-h-64 place-items-center p-6 sm:p-10"
            >
              <Preview key={run} values={values} />
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
              className="p-3"
            >
              <CodeTabs
                label="Code"
                tabs={[{ id: 'code', label: file ?? `${item.slug}.tsx`, code: code(values) }]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </AutoHeight>
    </div>
  );
}
