import { AnimatePresence, motion } from 'motion/react';
import type { Ref } from 'react';
import { groups, type Group } from '@registry/catalog';
import { fade, softSpring } from '@registry/components/interlude/primitives/motion';
import { ComponentCard } from './component-card';
import { items, type Item } from './items';
import { Segmented } from './ui';

export type Filter = 'all' | Group;

export const isGroup = (v: unknown): v is Group => groups.some((g) => g.id === v);

/** Every component as a card; each links to its playground page. */
export function ComponentGrid({
  filter,
  onFilterChange,
}: {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}) {
  const shown = items.filter((i) => filter === 'all' || i.group === filter);
  const blurb =
    filter === 'all'
      ? 'Every component, by what it does.'
      : groups.find((g) => g.id === filter)!.blurb;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line-strong pb-4">
        <Segmented<Filter>
          label="Filter by purpose"
          wrap
          value={filter}
          onChange={onFilterChange}
          options={[
            { value: 'all', label: `all ${items.length}` },
            ...groups.map((g) => ({
              value: g.id,
              label: `${g.id.toLowerCase()} ${items.filter((i) => i.group === g.id).length}`,
            })),
          ]}
        />
        {/* Fixed-height slot: the description swaps without moving anything around it. */}
        <div className="relative h-5 min-w-0 flex-1 overflow-hidden text-right text-sm text-muted">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={filter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={fade}
              className="truncate"
            >
              {blurb}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <ul
        aria-label={`${shown.length} components`}
        className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((item) => (
            <GridItem key={item.slug} item={item} />
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
}

function GridItem({
  item,
  ref,
}: {
  item: Item;
  /** AnimatePresence's popLayout mode measures the exiting card through this. */
  ref?: Ref<HTMLLIElement>;
}) {
  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.14 } }}
      transition={softSpring}
    >
      <ComponentCard item={item} />
    </motion.li>
  );
}
