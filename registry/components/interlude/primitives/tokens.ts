import type { CSSProperties } from 'react';
import type { StatusKind } from './status';

/**
 * Components read colour through --il-* variables, which resolve to the
 * host's --interlude-* tokens when set and to neutral defaults otherwise, so
 * nothing needs a theme to look right. Text and borders use currentColor.
 */
export function themeVars(accent?: string): CSSProperties {
  return {
    '--il-accent': accent ?? 'var(--interlude-accent, oklch(0.7 0.18 48))',
    '--il-success': 'var(--interlude-success, oklch(0.7 0.15 155))',
    '--il-danger': 'var(--interlude-danger, oklch(0.64 0.21 27))',
    '--il-warning': 'var(--interlude-warning, oklch(0.8 0.15 85))',
    '--il-panel': 'var(--interlude-panel, transparent)',
    '--il-scrim': 'color-mix(in oklab, var(--interlude-surface, Canvas) 84%, transparent)',
  } as CSSProperties;
}

/** Text colour per status kind. Always paired with an icon or label, never colour alone. */
export const kindText: Record<StatusKind, string> = {
  idle: 'opacity-45',
  active: 'text-(color:--il-accent)',
  waiting: 'text-(color:--il-warning)',
  success: 'text-(color:--il-success)',
  error: 'text-(color:--il-danger)',
  cancelled: 'opacity-45',
};

/** Shared surface classes so every card sits on the same visual plane. */
export const surface =
  'rounded-[14px] border border-current/10 bg-(--il-panel) text-sm shadow-[0_1px_2px_rgb(0_0_0/0.04)]';
export const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-(--il-accent) focus-visible:ring-offset-1 focus-visible:ring-offset-transparent';
