import { useRouterState } from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Icon } from '@registry/components/interlude/primitives/icons';
import { fade, softSpring, spring } from '@registry/components/interlude/primitives/motion';
import { useTint } from '@registry/components/interlude/primitives/tint';
import { cx } from '../ui';
import { docEntries, docKeyFor, DocLink, neighbours, type DocEntry } from './order';
import type { TocEntry } from './toc';
import { useToc } from './use-toc';

/**
 * Three panes: every docs entry on the left, the article in the middle and
 * an outline of the current page on the right. Guides, the components
 * overview and component pages all use it, so they read as one set of docs.
 * The outline is read from the article's own headings and follows the reader.
 */
export function DocsLayout({
  current,
  eyebrow,
  title,
  description,
  wide = false,
  children,
}: {
  /** Key of the entry being shown (see docs/order). */
  current: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Let the article use the full middle column (grids rather than prose). */
  wide?: boolean;
  children: ReactNode;
}) {
  const article = useRef<HTMLElement>(null);
  const { entries, active, select } = useToc(article, current);
  return (
    <div className="xl:flex xl:gap-10">
      <div className="min-w-0 flex-1">
        <article ref={article} className={cx('mx-auto', !wide && 'max-w-[44rem]')}>
          <header className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h1>
            </div>
            <StepButtons current={current} />
          </header>
          <p className="mt-3 text-lg text-muted">{description}</p>
          <div className="mt-10">{children}</div>
          <PrevNext current={current} />
        </article>
      </div>

      {entries.length > 0 && (
        <aside aria-label="On this page" className="hidden w-52 shrink-0 xl:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] scrollbar-none overflow-y-auto">
            <Outline entries={entries} active={active} onSelect={select} />
          </div>
        </aside>
      )}
    </div>
  );
}

/**
 * The docs frame: the sidebar lives here, above the pages, so it stays mounted
 * as you navigate and the active pill glides from the previous entry.
 */
export function DocsShell({ children }: { children: ReactNode }) {
  const current = useRouterState({ select: (s) => docKeyFor(s.location.pathname) });
  return (
    <div className="page grid gap-10 py-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside aria-label="Documentation" className="relative hidden lg:block">
        <span className="dots-y absolute inset-y-0 -right-5" aria-hidden />
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] scrollbar-none overflow-y-auto pr-2 pb-8">
          <DocsNav current={current} />
        </div>
      </aside>
      {children}
      <NavSheet current={current} />
    </div>
  );
}

function NavHeading({ children }: { children: string }) {
  return <h2 className="mb-1.5 px-2.5 text-[11px] font-medium text-faint">{children}</h2>;
}

function DocsNav({
  current,
  layoutId = 'docs-nav-active',
}: {
  current: string;
  layoutId?: string;
}) {
  const sections = [...new Set(docEntries.map((e) => e.section))];
  return (
    <nav className="flex flex-col gap-6 text-[13.5px]">
      {sections.map((section) => (
        <div key={section}>
          <NavHeading>{section}</NavHeading>
          <ul className="flex flex-col">
            {docEntries
              .filter((e) => e.section === section)
              .map((e) => (
                <li key={e.key}>
                  <NavItem entry={e} active={e.key === current} layoutId={layoutId} />
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** A docs link whose active pill glides between entries. */
function NavItem({
  entry,
  active,
  layoutId,
}: {
  entry: DocEntry;
  active: boolean;
  layoutId: string;
}) {
  const { style, ...tint } = useTint({ hover: 4, press: 7 });
  return (
    <DocLink entry={entry} current={active} className="relative block rounded-[8px]">
      {active && (
        <motion.span
          layoutId={layoutId}
          transition={softSpring}
          className="absolute inset-0 rounded-[8px] bg-fg/[0.07]"
        />
      )}
      <motion.span
        {...(active ? {} : tint)}
        style={active ? undefined : style}
        className={cx(
          'relative block rounded-[8px] px-2.5 py-1.5 whitespace-nowrap',
          active ? 'font-medium text-fg' : 'text-muted',
        )}
      >
        {entry.title}
      </motion.span>
    </DocLink>
  );
}

/** Below the wide breakpoint the sidebar lives in a sheet opened from a floating button. */
function NavSheet({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [current]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <div className="lg:hidden">
      <motion.button
        type="button"
        aria-label="Documentation menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.92 }}
        transition={spring}
        className="fixed right-5 bottom-5 z-40 grid size-14 place-items-center rounded-full border border-line bg-raised text-fg shadow-[0_6px_24px_rgb(0_0_0/0.28)] outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Icon name="menu" className="size-5" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              aria-hidden
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
              className="fixed inset-0 z-50 bg-black/50"
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Documentation"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={softSpring}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-[18px] border-t border-line bg-raised px-4 pt-3 pb-8"
            >
              <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-fg/20" aria-hidden />
              <DocsNav current={current} layoutId="docs-sheet-active" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Auto-generated outline. A marker glides along the rail to the section being read. */
function Outline({
  entries,
  active,
  onSelect,
}: {
  entries: TocEntry[];
  active: string | null;
  onSelect: (id: string) => void;
}) {
  const reduced = !!useReducedMotion();
  if (entries.length === 0) return null;
  const jump = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    onSelect(id);
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };
  return (
    <nav className="text-[13px]">
      <h2 className="mb-3 text-[11px] font-medium text-faint">On this page</h2>
      <ul className="relative">
        <span className="dots-y absolute inset-y-0 left-0" aria-hidden />
        {entries.map((e) => {
          const on = e.id === active;
          return (
            <li key={e.id} className="relative">
              {on && (
                <motion.span
                  layoutId="docs-toc-active"
                  transition={softSpring}
                  className="absolute top-0 -left-px h-full w-px bg-accent"
                />
              )}
              <a
                href={`#${e.id}`}
                aria-current={on ? 'location' : undefined}
                onClick={(event) => jump(event, e.id)}
                className={cx('block py-1', e.level === 3 ? 'pl-6' : 'pl-3.5')}
              >
                <motion.span
                  className={cx('block', on && 'text-fg')}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0.6, x: on ? 2 : 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={spring}
                >
                  {e.text}
                </motion.span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Compact previous/next beside the title, like the footer links but always in reach. */
function StepButtons({ current }: { current: string }) {
  const { prev, next } = neighbours(current);
  return (
    <div className="mt-1 flex shrink-0 gap-1.5">
      {prev && <StepButton entry={prev} label={`Previous: ${prev.title}`} icon="back" />}
      {next && <StepButton entry={next} label={`Next: ${next.title}`} icon="forward" />}
    </div>
  );
}

function StepButton({
  entry,
  label,
  icon,
}: {
  entry: DocEntry;
  label: string;
  icon: 'back' | 'forward';
}) {
  const { style, ...tint } = useTint({ rest: 5, hover: 9, press: 13 });
  return (
    <DocLink entry={entry} label={label} className="rounded-[8px]">
      <motion.span
        {...tint}
        style={style}
        aria-hidden
        whileTap={{ scale: 0.92 }}
        transition={spring}
        className="grid size-8 place-items-center rounded-[8px] text-muted"
      >
        <Icon name="chevron" className={cx('size-3.5', icon === 'back' && 'rotate-180')} />
      </motion.span>
    </DocLink>
  );
}

function PrevNext({ current }: { current: string }) {
  const { prev, next } = neighbours(current);
  return (
    <nav aria-label="Pages" className="relative mt-16 grid gap-3 dotted-t pt-8 sm:grid-cols-2">
      {prev ? <PageLink entry={prev} direction="Previous" /> : <span />}
      {next && <PageLink entry={next} direction="Next" />}
    </nav>
  );
}

function PageLink({ entry, direction }: { entry: DocEntry; direction: 'Previous' | 'Next' }) {
  const { style, ...tint } = useTint({ hover: 3, press: 6 });
  const forward = direction === 'Next';
  return (
    <DocLink entry={entry} className={cx('block rounded-[12px]', forward && 'sm:col-start-2')}>
      <motion.span
        {...tint}
        style={style}
        whileHover="hover"
        className={cx('block rounded-[12px] border border-line px-4 py-3', forward && 'text-right')}
      >
        <span className="block text-xs text-faint">{direction}</span>
        <span className="mt-0.5 inline-flex items-center gap-1.5 font-medium">
          {!forward && (
            <motion.span variants={{ hover: { x: -3 } }} transition={spring} aria-hidden>
              ←
            </motion.span>
          )}
          {entry.title}
          {forward && (
            <motion.span variants={{ hover: { x: 3 } }} transition={spring} aria-hidden>
              →
            </motion.span>
          )}
        </span>
      </motion.span>
    </DocLink>
  );
}
