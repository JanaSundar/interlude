import { AnimatePresence, motion } from 'motion/react';
import { useId, useRef, useSyncExternalStore, type KeyboardEvent } from 'react';
import { AutoHeight } from '@registry/components/interlude/primitives/auto-size';
import { Fade } from '@registry/components/interlude/primitives/fade';
import { softSpring, spring } from '@registry/components/interlude/primitives/motion';
import { toLines, tokenize, type Lang, type TokenKind } from './highlight';
import { installCommandFor, packageManagers, type PackageManager } from './meta';
import { CopyButton, cx } from './ui';

export type CodeTab = { id: string; label: string; code: string; lang?: Lang };

const tokenClass: Record<TokenKind, string> = {
  comment: 'text-(--code-comment) italic',
  string: 'text-(--code-string)',
  keyword: 'text-(--code-keyword)',
  tag: 'text-(--code-tag)',
  number: 'text-(--code-number)',
  fn: 'text-(--code-fn)',
  prop: 'text-(--code-prop)',
  plain: '',
};

/* A choice (like the package manager) shared by every tab set with the same key, and remembered. */
const listeners = new Set<() => void>();
const memory = new Map<string, string>();
function readChoice(key: string) {
  if (!memory.has(key)) {
    try {
      const stored = localStorage.getItem(`interlude:${key}`);
      if (stored) memory.set(key, stored);
    } catch {
      // Storage unavailable: the choice lasts for this visit.
    }
  }
  return memory.get(key);
}
function writeChoice(key: string, value: string) {
  memory.set(key, value);
  try {
    localStorage.setItem(`interlude:${key}`, value);
  } catch {
    // Ignore; in-memory choice still syncs the page.
  }
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));

function useTabChoice(ids: string[], shareKey?: string) {
  const local = useRef(ids[0]!);
  const value = useSyncExternalStore(
    subscribe,
    () => (shareKey ? readChoice(shareKey) : local.current),
    () => undefined,
  );
  const active = value && ids.includes(value) ? value : ids[0]!;
  const set = (id: string) => {
    if (shareKey) writeChoice(shareKey, id);
    else {
      local.current = id;
      listeners.forEach((l) => l());
    }
  };
  return [active, set] as const;
}

/**
 * Tabbed code panel used for install commands, usage, generated playground
 * code and source files. Real tabs (arrow keys, Home/End), a gliding
 * indicator, highlighted lines and a copy button for the active tab.
 */
export function CodeTabs({
  tabs,
  label,
  shareKey,
  maxHeight,
  lineNumbers,
  className,
}: {
  tabs: CodeTab[];
  /** Accessible name for the tab list. */
  label: string;
  /** Tab sets with the same key switch together and remember the choice. */
  shareKey?: string;
  maxHeight?: string;
  lineNumbers?: boolean;
  className?: string;
}) {
  const uid = useId();
  const [activeId, setActive] = useTabChoice(
    tabs.map((t) => t.id),
    shareKey,
  );
  const tab = tabs.find((t) => t.id === activeId) ?? tabs[0]!;
  const lang = tab.lang ?? 'tsx';
  const lines = toLines(tokenize(tab.code, lang));
  const numbered = lineNumbers ?? (lang !== 'sh' && lines.length > 1);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.indexOf(tab);
    const next =
      e.key === 'ArrowRight'
        ? i + 1
        : e.key === 'ArrowLeft'
          ? i - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? tabs.length - 1
              : null;
    if (next === null) return;
    e.preventDefault();
    const target = tabs[(next + tabs.length) % tabs.length]!;
    setActive(target.id);
    document.getElementById(`${uid}-tab-${target.id}`)?.focus();
  };

  return (
    <div className={cx('overflow-hidden rounded-panel border border-line bg-raised', className)}>
      <div className="flex items-center gap-2 border-b border-line pr-1.5">
        <div
          role="tablist"
          aria-label={label}
          onKeyDown={onKeyDown}
          className="flex min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]"
        >
          {tabs.map((t) => {
            const on = t.id === tab.id;
            return (
              <button
                key={t.id}
                id={`${uid}-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`${uid}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(t.id)}
                className="relative h-10 shrink-0 px-3.5 font-mono text-[12px] outline-none focus-visible:bg-fg/[0.05]"
              >
                <motion.span
                  className="relative"
                  initial={false}
                  animate={{ opacity: on ? 1 : 0.5 }}
                  whileHover={{ opacity: 1 }}
                  transition={spring}
                >
                  {t.label}
                </motion.span>
                {on && (
                  <motion.span
                    layoutId={`${uid}-indicator`}
                    transition={softSpring}
                    className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-accent"
                  />
                )}
              </button>
            );
          })}
        </div>
        <CopyButton text={tab.code} label={`Copy ${tab.label}`} />
      </div>
      <AutoHeight>
        <AnimatePresence mode="popLayout" initial={false}>
          <Fade
            key={tab.id}
            lift
            id={`${uid}-panel`}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${tab.id}`}
          >
            <pre
              tabIndex={0}
              className="overflow-auto py-3.5 text-[12.5px] leading-[1.7] outline-none focus-visible:bg-fg/[0.02]"
              style={{ maxHeight }}
            >
              {/* Commands wrap so they never need a sideways scrollbar; code keeps its lines. */}
              <code className={cx('grid', lang === 'sh' ? 'min-w-0' : 'min-w-max')}>
                {lines.map((line, i) => (
                  <span
                    key={i}
                    className={cx(
                      'flex pr-5',
                      lang === 'sh' && 'whitespace-pre-wrap [overflow-wrap:anywhere]',
                    )}
                  >
                    {numbered && (
                      <span
                        aria-hidden
                        className="sticky left-0 w-11 shrink-0 bg-raised pr-4 text-right text-faint/60 select-none"
                      >
                        {i + 1}
                      </span>
                    )}
                    {lang === 'sh' && (
                      <span aria-hidden className="pl-4 pr-2.5 text-accent select-none">
                        $
                      </span>
                    )}
                    <span className={cx(!numbered && lang !== 'sh' && 'pl-4')}>
                      {line.length
                        ? line.map((t, j) => (
                            <span key={j} className={tokenClass[t.kind]}>
                              {t.text}
                            </span>
                          ))
                        : ' '}
                    </span>
                  </span>
                ))}
              </code>
            </pre>
          </Fade>
        </AnimatePresence>
      </AutoHeight>
    </div>
  );
}

/** One command per package manager; the choice follows you across the site. */
export function CommandTabs({
  command,
  className,
}: {
  command: (pm: PackageManager) => string;
  className?: string;
}) {
  return (
    <CodeTabs
      label="Package manager"
      shareKey="package-manager"
      className={className}
      tabs={packageManagers.map((pm) => ({ id: pm, label: pm, lang: 'sh', code: command(pm) }))}
    />
  );
}

/** The shadcn CLI command that adds a registry item. */
export function InstallTabs({ item, className }: { item: string; className?: string }) {
  return <CommandTabs command={(pm) => installCommandFor(pm, item)} className={className} />;
}
