import { Link, useRouterState } from '@tanstack/react-router';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { softSpring, spring } from '@registry/components/interlude/primitives/motion';
import { Logo } from './logo';
import { ThemeSwitch } from './theme-switch';

export { themeScript } from './theme-switch';
import { REPO_URL } from './meta';
import { cx } from './ui';

export function Wordmark() {
  return (
    <Link
      to="/"
      aria-label="Interlude home"
      className="inline-flex items-center gap-2 rounded-md text-[15px] font-semibold tracking-tight"
    >
      <Logo />
      interlude
    </Link>
  );
}

/** Link text that brightens with a spring instead of a CSS colour swap. */
export function HoverText({
  children,
  active = false,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <motion.span
      className={cx('relative inline-block', className)}
      initial={false}
      animate={{ opacity: active ? 1 : 0.62 }}
      whileHover={{ opacity: 1 }}
      transition={spring}
    >
      {children}
    </motion.span>
  );
}

const nav = [
  { to: '/docs/components', label: 'Components' },
  { to: '/docs', label: 'Docs' },
] as const;

/** Pure: which top-level section a path belongs to. Components live inside the docs. */
export const navSection = (path: string) =>
  path.startsWith('/docs/components')
    ? '/docs/components'
    : path.startsWith('/docs')
      ? '/docs'
      : null;

export function Header() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-40 dotted-b bg-bg/80 backdrop-blur-md">
      <div className="page flex h-14 items-center gap-3 sm:gap-6">
        <Wordmark />
        <nav aria-label="Main" className="flex items-center text-sm sm:gap-1">
          {nav.map((n) => {
            const active = navSection(path) === n.to;
            return (
              <Link key={n.to} to={n.to} className="relative rounded-md">
                <HoverText active={active} className="px-2.5 py-1.5">
                  {n.label}
                </HoverText>
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    transition={softSpring}
                    className="absolute inset-x-2.5 -bottom-[11px] h-px bg-accent"
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <a href={REPO_URL} className="hidden rounded-md text-sm sm:block">
            <HoverText className="px-2.5 py-1.5">GitHub</HoverText>
          </a>
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative dotted-t">
      <div className="page flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-muted">
        <span className="inline-flex items-center gap-2 font-mono text-xs text-faint">
          <Logo className="h-3 w-auto" />
          components for the in-between
        </span>
        <span className="flex gap-5">
          <a href={REPO_URL}>
            <HoverText>Source</HoverText>
          </a>
          <Link to="/docs">
            <HoverText>Docs</HoverText>
          </Link>
          <span className="text-faint">MIT</span>
        </span>
      </div>
    </footer>
  );
}

export function SectionLabel({
  index,
  children,
  className,
}: {
  index: string;
  children: string;
  className?: string;
}) {
  return (
    <p className={cx('eyebrow flex items-center gap-3', className)}>
      <span className="text-accent">{index}</span>
      <span className="dots-x w-6" aria-hidden />
      {children}
    </p>
  );
}
