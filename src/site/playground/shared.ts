import type { ReducedMotion } from '@registry/components/interlude/primitives/motion';
import type { TaskStatus } from '@registry/components/interlude/primitives/status';
import type { Control, Values } from './playground';

export const accentControl: Control = { type: 'color', key: 'accent', label: 'accent' };
export const motionControl: Control = {
  type: 'choice',
  key: 'reducedMotion',
  label: 'reducedMotion',
  options: ['user', 'always', 'never'],
};
export const appearanceDefaults = { accent: 'default', reducedMotion: 'user' } satisfies Values;

/** Props shared by every component, as the component should receive them. */
export const appearance = (v: Values) => ({
  accent: v.accent === 'default' ? undefined : String(v.accent),
  reducedMotion: v.reducedMotion as ReducedMotion,
});

/** Same, for generated code: omitted when left at the component default. */
export const appearanceCode = (v: Values) => ({
  accent: v.accent === 'default' ? undefined : v.accent,
  reducedMotion: v.reducedMotion === 'user' ? undefined : v.reducedMotion,
});

/**
 * Set by cards at rest: previews show a settled, complete frame (full logs,
 * finished text, no timers) and run with reduced motion, so nothing moves
 * until the card is hovered or focused.
 */
export const isStill = (v: Values) => v.still === true;

export const taskStatuses = ['loading', 'success', 'error', 'cancelled', 'idle'] as const;
export const statusControl: Control = {
  type: 'choice',
  key: 'status',
  label: 'status',
  options: taskStatuses,
};
export const asStatus = (v: Values) => v.status as TaskStatus;

export const times = (v: number) => `${v}×`;
export const px = (v: number) => `${v}px`;

/** A free-text "label" prop; `placeholder` says what an empty value means. */
export const labelControl = (placeholder?: string): Control => ({
  type: 'text',
  key: 'label',
  label: 'label',
  placeholder,
});

/** A pixel "size" prop. */
export const sizeControl = (min: number, max: number): Control => ({
  type: 'range',
  key: 'size',
  label: 'size',
  min,
  max,
  step: 1,
  format: px,
});

/** The dotted stage a live preview sits on; every preview box uses it. */
export const stageClass = (minHeight: string) =>
  `stage-grid grid ${minHeight} grid-cols-[minmax(0,1fr)] place-items-center p-6 sm:p-10`;

/** Import line plus element, the way a snippet should read. */
export const snippet = (importLine: string, element: string, setup?: string) =>
  [importLine, '', ...(setup ? [setup, ''] : []), element].join('\n');
