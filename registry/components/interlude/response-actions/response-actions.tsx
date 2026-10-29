import { AnimatePresence, motion } from 'motion/react';
import type { KeyboardEvent } from 'react';
import { cx } from '../primitives/cx';
import type { IconName } from '../primitives/icons';
import { LiveRegion } from '../primitives/live-region';
import { Pressable } from '../primitives/pressable';
import { fade } from '../primitives/motion';
import { SwapIcon } from '../primitives/swap-icon';
import { themeVars } from '../primitives/tokens';
import { useCopy } from '../primitives/use-copy';
import { AutoWidth } from '../primitives/auto-size';

export type BuiltInAction = 'copy' | 'regenerate' | 'retry' | 'edit' | 'continue';
export type CustomAction = { id: string; label: string; icon?: IconName; disabled?: boolean };

export type ResponseActionsProps = {
  /** Built-in ids or custom actions, in display order. */
  actions: readonly (BuiltInAction | CustomAction)[];
  /** Called with the action id. "copy" is handled here when `copyText` is given. */
  onAction?: (id: string) => void;
  /** Text placed on the clipboard by the copy action. */
  copyText?: string;
  /** Show labels next to icons. */
  labels?: boolean;
  accent?: string;
  className?: string;
};

const builtIns: Record<BuiltInAction, { label: string; icon: IconName }> = {
  copy: { label: 'Copy', icon: 'copy' },
  regenerate: { label: 'Regenerate', icon: 'refresh' },
  retry: { label: 'Retry', icon: 'refresh' },
  edit: { label: 'Edit', icon: 'edit' },
  continue: { label: 'Continue', icon: 'arrow' },
};

const toCustom = (a: BuiltInAction | CustomAction): CustomAction =>
  typeof a === 'string' ? { id: a, ...builtIns[a] } : a;

/** A toolbar for a finished response. Arrow keys move between actions. */
export function ResponseActions({
  actions,
  onAction,
  copyText,
  labels = false,
  accent,
  className,
}: ResponseActionsProps) {
  const items = actions.map(toCustom);
  const { state: copy, copy: copyToClipboard } = useCopy();

  const run = async (id: string) => {
    if (id === 'copy' && copyText !== undefined) await copyToClipboard(copyText);
    onAction?.(id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const buttons = [
      ...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
    ];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? buttons.length - 1
          : at + (e.key === 'ArrowRight' ? 1 : -1);
    buttons[(next + buttons.length) % buttons.length]?.focus();
    e.preventDefault();
  };

  return (
    <div
      role="toolbar"
      aria-label="Response actions"
      onKeyDown={onKeyDown}
      style={themeVars(accent)}
      className={cx('inline-flex items-center gap-0.5', className)}
    >
      <LiveRegion message={copy === 'copied' ? 'Copied' : copy === 'failed' ? 'Copy failed' : ''} />
      {items.map((a) => {
        const isCopy = a.id === 'copy' && copy !== 'idle';
        const icon: IconName = isCopy ? (copy === 'copied' ? 'check' : 'x') : (a.icon ?? 'dot');
        const label = isCopy ? (copy === 'copied' ? 'Copied' : 'Copy failed') : a.label;
        return (
          <Pressable
            key={a.id}
            disabled={a.disabled}
            dim={!(isCopy && copy === 'copied')}
            pressScale={0.92}
            aria-label={labels ? undefined : a.label}
            title={a.label}
            onClick={() => void run(a.id)}
            className={cx(
              'inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 text-xs',
              isCopy && copy === 'copied' && 'text-(color:--il-success)',
            )}
          >
            <SwapIcon name={icon} />
            {labels && (
              <AutoWidth>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={label}
                    className="whitespace-nowrap"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={fade}
                  >
                    {label}
                  </motion.span>
                </AnimatePresence>
              </AutoWidth>
            )}
          </Pressable>
        );
      })}
    </div>
  );
}
