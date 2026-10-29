import type { ComponentType, ReactNode } from 'react';
import type { DotPattern } from '../primitives/dot-matrix';
import type { TaskStatus } from './lifecycle';

export type GameProps = {
  /** True when the game must not advance (unfocused, paused, or exiting). */
  paused: boolean;
  /** Simulation speed multiplier, 0.5–2. */
  speed: number;
  reducedMotion: boolean;
  /** Fixed seed for deterministic play; random when omitted. */
  seed?: number;
  /** Polite screen-reader announcement. */
  announce: (message: string) => void;
  onStatusChange: (status: 'playing' | 'over') => void;
};

export type GameDefinition = {
  name: string;
  pattern: DotPattern;
  Game: ComponentType<GameProps>;
  /** Real-time games pause when the stage loses focus. */
  realtime: boolean;
  /** One-line control hint shown under the board. */
  controls: string;
};

export type InterludeProps = {
  /** Full task status. Takes precedence over `active`. */
  status?: TaskStatus;
  /** Shorthand for apps that only have a boolean: true → loading, false → idle. */
  active?: boolean;
  /** What the task is doing, e.g. "Generating your response". */
  label?: string;
  /** Loader width in px. */
  size?: number;
  /** Any CSS color; defaults to var(--interlude-accent). */
  accent?: string;
  /** Loader and game speed multiplier, 0.5–2. */
  speed?: number;
  /** "user" follows the OS setting. */
  reducedMotion?: 'user' | 'always' | 'never';
  /** Controlled discovery state. */
  discovered?: boolean;
  onDiscoveredChange?: (discovered: boolean) => void;
  /** Rendered when the task ends; receives the terminal status. */
  result?: ReactNode | ((status: TaskStatus) => ReactNode);
  /** Show a faint "play while you wait" hint next to the label. */
  hint?: boolean;
  seed?: number;
  className?: string;
};
