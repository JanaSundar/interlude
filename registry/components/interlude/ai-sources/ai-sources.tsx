import { motion, MotionConfig } from 'motion/react';
import { createContext, useContext, useId, useMemo, type ReactNode } from 'react';
import { Collapsible, useDisclosure } from '../primitives/collapsible';
import { cx } from '../primitives/cx';
import { Icon } from '../primitives/icons';
import { Pressable } from '../primitives/pressable';
import { useTint } from '../primitives/tint';
import { softSpring, spring, useReducedPreference, type ReducedMotion } from '../primitives/motion';
import { focusRing, surface, themeVars } from '../primitives/tokens';
import { resolveSources, sourceAnchor, type ResolvedSource } from './sources';

type Ctx = { scope: string; sources: ResolvedSource[] };
const SourcesContext = createContext<Ctx | null>(null);

export type SourcesProviderProps = {
  /** Exactly what your retrieval returned. Invalid entries are dropped, never filled in. */
  sources: readonly unknown[];
  children: ReactNode;
  accent?: string;
  reducedMotion?: ReducedMotion;
  className?: string;
};

/** Shares one numbered source list between inline citations and the source list. */
export function SourcesProvider({
  sources,
  children,
  accent,
  reducedMotion,
  className,
}: SourcesProviderProps) {
  const scope = useId().replace(/[^a-z0-9]/gi, '');
  const resolved = useMemo(() => resolveSources(sources), [sources]);
  const reduced = useReducedPreference(reducedMotion);
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <SourcesContext.Provider value={{ scope, sources: resolved }}>
        <div style={themeVars(accent)} className={className}>
          {children}
        </div>
      </SourcesContext.Provider>
    </MotionConfig>
  );
}

function useSources(): Ctx {
  const ctx = useContext(SourcesContext);
  if (!ctx) throw new Error('Citation and SourceList must be inside <SourcesProvider>.');
  return ctx;
}

/** Inline reference like [2]. Shows a muted [?] when the id isn't among the supplied sources. */
export function Citation({ id }: { id: string }) {
  const { scope, sources } = useSources();
  const source = sources.find((s) => s.id === id);
  if (!source) {
    return (
      <sup
        className="mx-0.5 font-mono text-[10px] opacity-40"
        title="This citation has no matching source"
      >
        [?]
      </sup>
    );
  }
  return (
    <sup>
      <CitationLink
        href={`#${sourceAnchor(scope, source.id)}`}
        label={`Source ${source.n}: ${source.label}`}
      >
        {source.n}
      </CitationLink>
    </sup>
  );
}

function CitationLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  const { style, ...handlers } = useTint({ rest: 8, hover: 18, press: 26 });
  return (
    <motion.a
      href={href}
      aria-label={label}
      {...handlers}
      style={style}
      whileHover={{ y: -1 }}
      transition={spring}
      className={cx(
        'mx-0.5 inline-grid min-w-4 place-items-center rounded-[5px] px-1 font-mono text-[10px] no-underline',
        focusRing,
      )}
    >
      {children}
    </motion.a>
  );
}

export function SourceList({
  title = 'Sources',
  className,
}: {
  title?: string;
  className?: string;
}) {
  const { scope, sources } = useSources();
  if (sources.length === 0) return null;
  return (
    <section aria-label={title} className={cx(surface, 'p-1.5', className)}>
      <h3 className="px-2.5 pt-1.5 pb-1.5 text-[13px] font-medium">
        {title}{' '}
        <span className="font-mono text-[11px] font-normal opacity-50">{sources.length}</span>
      </h3>
      <ol className="flex flex-col">
        {sources.map((s, i) => (
          <SourceRow key={s.id} source={s} anchor={sourceAnchor(scope, s.id)} index={i} />
        ))}
      </ol>
    </section>
  );
}

function SourceRow({
  source,
  anchor,
  index,
}: {
  source: ResolvedSource;
  anchor: string;
  index: number;
}) {
  const { open, panelId, triggerProps } = useDisclosure();
  const preview = source.excerpt ?? source.description;
  return (
    <motion.li
      id={anchor}
      tabIndex={-1}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...softSpring, delay: index * 0.04 }}
      className="scroll-mt-24 rounded-[9px] outline-none target:bg-current/[0.06]"
    >
      <div className="flex items-center gap-2.5 px-2.5 py-1.5 text-[13px]">
        <span className="grid size-4 shrink-0 place-items-center rounded-[4px] bg-current/[0.08] font-mono text-[10px]">
          {source.n}
        </span>
        <span className="min-w-0 flex-1">
          {source.href ? (
            <a
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cx(
                'group inline-flex max-w-full items-center gap-1 hover:underline',
                focusRing,
              )}
            >
              <span className="truncate">{source.label}</span>
              <Icon name="external" className="size-3 shrink-0 opacity-40 group-hover:opacity-80" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : (
            <span className={cx('block truncate', source.unavailable && 'opacity-50')}>
              {source.label}
            </span>
          )}
          <span className="block truncate font-mono text-[11px] opacity-45">
            {source.unavailable ? 'unavailable' : (source.host ?? 'no link provided')}
          </span>
        </span>
        {preview && (
          <Pressable
            {...triggerProps}
            dim
            pressScale={0.9}
            aria-label={`${open ? 'Hide' : 'Show'} preview of ${source.label}`}
            className="grid size-6 shrink-0 place-items-center rounded-md"
          >
            <motion.span animate={{ rotate: open ? 90 : 0 }} transition={softSpring}>
              <Icon name="chevron" className="size-3" />
            </motion.span>
          </Pressable>
        )}
      </div>
      {preview && (
        <Collapsible open={open} id={panelId}>
          <blockquote className="mx-2.5 mb-2 ml-9 border-l-2 border-(--il-accent)/40 pl-3 text-[12.5px] leading-relaxed opacity-75">
            {preview}
          </blockquote>
        </Collapsible>
      )}
    </motion.li>
  );
}
