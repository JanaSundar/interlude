import { Link } from '@tanstack/react-router';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState, type FocusEvent } from 'react';
import { Icon } from '@registry/components/interlude/primitives/icons';
import { softSpring } from '@registry/components/interlude/primitives/motion';
import { useTint } from '@registry/components/interlude/primitives/tint';
import type { Item } from './items';
import type { Values } from './playground/playground';

/**
 * Demo values: the playground defaults without the always-on "play" hint.
 * At rest a card is still (settled frame, reduced motion); live, it runs.
 */
const demoValues = (item: Item, live: boolean): Values => ({
  ...item.playground.defaults,
  hint: false,
  reducedMotion: live ? 'user' : 'always',
  still: !live,
});

/** The demo, decorative and non-interactive (it sits inside a card). */
function Specimen({ item, live }: { item: Item; live: boolean }) {
  const { Preview } = item.playground;
  return (
    <div aria-hidden inert className="pointer-events-none origin-center scale-[0.82]">
      {/* Remounts on hover, so replays and streams start fresh. */}
      <Preview key={live ? 'live' : 'still'} values={demoValues(item, live)} />
    </div>
  );
}

/**
 * A component card with a still preview that comes alive on hover or
 * focus. The whole card links to the component's playground page.
 */
export function ComponentCard({ item }: { item: Item }) {
  const ref = useRef<HTMLDivElement>(null);
  // Mount the preview the first time the card nears the viewport, then keep it.
  const seen = useInView(ref, { once: true, margin: '200px' });
  const reduced = !!useReducedMotion();
  const [live, setLive] = useState(false);
  const { style, onHoverStart, onHoverEnd } = useTint({ hover: 2.5, press: 5 });
  const { Glyph } = item;
  return (
    <motion.div
      ref={ref}
      onHoverStart={() => {
        onHoverStart();
        setLive(true);
      }}
      onHoverEnd={() => {
        onHoverEnd();
        setLive(false);
      }}
      whileHover="hover"
      transition={softSpring}
      style={style}
      className="relative flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-raised"
    >
      <div className="flex flex-1 flex-col">
        <div className="stage-grid grid min-h-0 flex-[1_1_12rem] place-items-center overflow-hidden border-b border-line p-4">
          {seen ? <Specimen item={item} live={live} /> : <Glyph reduced={reduced} />}
        </div>
        <div className="flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <h3 className="font-medium">{item.name}</h3>
            <p className="mt-0.5 truncate text-sm text-muted">{item.tagline}</p>
          </div>
          <motion.span
            aria-hidden
            variants={{ hover: { x: 2, y: -2, opacity: 1 } }}
            initial={{ opacity: 0.45 }}
            transition={softSpring}
            className="mt-1 text-accent"
          >
            <Icon name="arrow" className="size-3.5 -rotate-45" />
          </motion.span>
        </div>
      </div>
      {/* One clean hit target over the whole card; the preview stays inert. */}
      <Link
        to="/docs/components/$slug"
        params={{ slug: item.slug }}
        aria-label={`${item.name}: ${item.tagline}`}
        {...focusLive(setLive)}
        className={hitTarget}
      />
    </motion.div>
  );
}

/** Keyboard focus wakes the preview the same way hover does. */
const focusLive = (setLive: (live: boolean) => void) => ({
  onFocus: (e: FocusEvent<HTMLElement>) => setLive(e.currentTarget.matches(':focus-visible')),
  onBlur: () => setLive(false),
});

const hitTarget =
  'absolute inset-0 rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset';
