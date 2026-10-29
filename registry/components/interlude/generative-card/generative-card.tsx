import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useMemo } from 'react';
import { AutoHeight } from '../primitives/auto-size';
import { cx } from '../primitives/cx';
import { Icon } from '../primitives/icons';
import { softSpring, useReducedPreference, type ReducedMotion } from '../primitives/motion';
import { Pressable } from '../primitives/pressable';
import { surface, themeVars } from '../primitives/tokens';
import { BlockView } from './blocks';
import { parseCard, type CardKind } from './card';

export type GenerativeCardProps = {
  /** A CardSpec object or JSON string from your model. Validated before anything renders. */
  spec: unknown;
  /** Called with an action id. Running the action is up to your app. */
  onAction?: (id: string) => void;
  /** Set while the result is still streaming; partial cards render what is valid so far. */
  streaming?: boolean;
  accent?: string;
  reducedMotion?: ReducedMotion;
  className?: string;
};

const kindLabel: Record<CardKind, string> = {
  summary: 'Summary',
  recommendation: 'Recommendation',
  plan: 'Plan',
  comparison: 'Comparison',
  info: 'Details',
  preview: 'Preview',
};

export function GenerativeCard({
  spec,
  onAction,
  streaming = false,
  accent,
  reducedMotion,
  className,
}: GenerativeCardProps) {
  const { card, issues } = useMemo(() => parseCard(spec), [spec]);
  const reduced = useReducedPreference(reducedMotion);

  if (!card) {
    if (streaming) return null;
    return (
      <div role="note" style={themeVars(accent)} className={cx(surface, 'p-4', className)}>
        <p className="flex items-center gap-2 font-medium">
          <span className="text-(color:--il-danger)">
            <Icon name="alert" />
          </span>
          This result couldn’t be displayed
        </p>
        <ul className="mt-2 list-disc pl-5 font-mono text-[11px] opacity-60">
          {issues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <motion.article
        aria-busy={streaming}
        aria-label={card.title}
        style={themeVars(accent)}
        className={cx(surface, 'overflow-hidden', className)}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={softSpring}
      >
        <header className="border-b border-current/[0.07] px-4 pt-3.5 pb-3">
          <p className="font-mono text-[10px] tracking-wider uppercase opacity-45">
            {kindLabel[card.kind]}
          </p>
          <h3 className="mt-0.5 text-[15px] font-semibold tracking-tight">{card.title}</h3>
          {card.subtitle && <p className="mt-0.5 text-[13px] opacity-60">{card.subtitle}</p>}
        </header>
        {/* Body and footer sit in a measured box: streamed blocks and the
            action row arriving grow the card smoothly, without stretching text. */}
        <AutoHeight>
          <div className="flex flex-col gap-3.5 px-4 py-3.5">
            {card.blocks.map((block, i) => (
              <motion.div
                key={i}
                layout="position"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...softSpring, delay: Math.min(i, 6) * 0.04 }}
              >
                <BlockView block={block} />
              </motion.div>
            ))}
          </div>
          <AnimatePresence initial={false}>
            {card.actions && card.actions.length > 0 && !streaming && (
              <motion.footer
                key="actions"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={softSpring}
                className="flex flex-wrap gap-2 border-t border-current/[0.07] px-4 py-3"
              >
                {card.actions.map((a, i) => (
                  <Pressable
                    key={a.id}
                    solid={i === 0}
                    tint={{ rest: 6, hover: 10, press: 14 }}
                    onClick={() => onAction?.(a.id)}
                    className={cx(
                      'rounded-full px-3 py-1.5 text-xs font-medium',
                      i === 0 && 'bg-(--il-accent) text-white',
                    )}
                  >
                    {a.label}
                  </Pressable>
                ))}
              </motion.footer>
            )}
          </AnimatePresence>
        </AutoHeight>
      </motion.article>
    </MotionConfig>
  );
}
