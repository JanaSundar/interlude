import type { ComponentType } from 'react';
import { catalog, type CatalogEntry } from '@registry/catalog';
import { breakout, BreakoutLoader } from '@registry/components/interlude/breakout/breakout';
import type { GameDefinition, InterludeProps } from '@registry/components/interlude/core/types';
import { dinoRun, DinoRunLoader } from '@registry/components/interlude/dino-run/dino-run';
import { DotMatrixLoader } from '@registry/components/interlude/dot-matrix-loader/dot-matrix-loader';
import {
  fallingBlocks,
  FallingBlocksLoader,
} from '@registry/components/interlude/falling-blocks/falling-blocks';
import {
  memoryMatch,
  MemoryMatchLoader,
} from '@registry/components/interlude/memory-match/memory-match';
import { merge2048, Merge2048Loader } from '@registry/components/interlude/merge-2048/merge-2048';
import { OrbitalLoader } from '@registry/components/interlude/orbital-loader/orbital-loader';
import { pong, PongLoader } from '@registry/components/interlude/pong/pong';
import { DotMatrix } from '@registry/components/interlude/primitives/dot-matrix';
import { Icon, type IconName } from '@registry/components/interlude/primitives/icons';
import { ProgressLoader } from '@registry/components/interlude/progress-loader/progress-loader';
import { PulseLoader } from '@registry/components/interlude/pulse-loader/pulse-loader';
import {
  reactionTest,
  ReactionTestLoader,
} from '@registry/components/interlude/reaction-test/reaction-test';
import {
  slidingPuzzle,
  SlidingPuzzleLoader,
} from '@registry/components/interlude/sliding-puzzle/sliding-puzzle';
import { snake, SnakeLoader } from '@registry/components/interlude/snake/snake';
import {
  spaceShooter,
  SpaceShooterLoader,
} from '@registry/components/interlude/space-shooter/space-shooter';
import { thinkingPatterns } from '@registry/components/interlude/thinking-indicator/patterns';
import {
  whackAMole,
  WhackAMoleLoader,
} from '@registry/components/interlude/whack-a-mole/whack-a-mole';
import { activitySpec, approvalSpec, thinkingSpec, toolCallSpec } from './playground/ai-specs';
import { gameSpec, progressSpec, skeletonSpec, statusLoaderSpec } from './playground/loader-specs';
import { actionsSpec, cardSpec, markdownSpec, sourcesSpec } from './playground/output-specs';
import type { PlaygroundSpec } from './playground/playground';
import { gameProps, propsFor, type PropDoc } from './props';

const games: Record<string, { definition: GameDefinition; Loader: ComponentType<InterludeProps> }> =
  {
    snake: { definition: snake, Loader: SnakeLoader },
    'falling-blocks': { definition: fallingBlocks, Loader: FallingBlocksLoader },
    pong: { definition: pong, Loader: PongLoader },
    breakout: { definition: breakout, Loader: BreakoutLoader },
    'merge-2048': { definition: merge2048, Loader: Merge2048Loader },
    'memory-match': { definition: memoryMatch, Loader: MemoryMatchLoader },
    'whack-a-mole': { definition: whackAMole, Loader: WhackAMoleLoader },
    'space-shooter': { definition: spaceShooter, Loader: SpaceShooterLoader },
    'sliding-puzzle': { definition: slidingPuzzle, Loader: SlidingPuzzleLoader },
    'dino-run': { definition: dinoRun, Loader: DinoRunLoader },
    'reaction-test': { definition: reactionTest, Loader: ReactionTestLoader },
  };

type Glyph = (p: { reduced: boolean }) => React.ReactNode;

const matrix = (pattern: Parameters<typeof DotMatrix>[0]['pattern']): Glyph =>
  function MatrixGlyph({ reduced }) {
    return <DotMatrix pattern={pattern} size={16} reduced={reduced} />;
  };
const icon = (name: IconName): Glyph =>
  function IconGlyph() {
    return <Icon name={name} className="size-4 text-accent" />;
  };
const live = (
  Loader: ComponentType<{ status: 'loading'; size: number; reducedMotion: 'always' | 'user' }>,
): Glyph =>
  function LiveGlyph({ reduced }) {
    return <Loader status="loading" size={16} reducedMotion={reduced ? 'always' : 'user'} />;
  };

const runtime: Record<string, { Glyph: Glyph; playground: PlaygroundSpec }> = {
  'dot-matrix-loader': {
    Glyph: live(DotMatrixLoader),
    playground: statusLoaderSpec('DotMatrixLoader', 'dot-matrix-loader', DotMatrixLoader, {
      initial: 24,
      default: 16,
      min: 10,
      max: 48,
    }),
  },
  'orbital-loader': {
    Glyph: live(OrbitalLoader),
    playground: statusLoaderSpec('OrbitalLoader', 'orbital-loader', OrbitalLoader, {
      initial: 28,
      default: 18,
      min: 12,
      max: 56,
    }),
  },
  'pulse-loader': {
    Glyph: live(PulseLoader),
    playground: statusLoaderSpec('PulseLoader', 'pulse-loader', PulseLoader, {
      initial: 28,
      default: 18,
      min: 12,
      max: 56,
    }),
  },
  'progress-loader': {
    Glyph: ({ reduced }) => (
      <ProgressLoader status="loading" size={22} reducedMotion={reduced ? 'always' : 'user'} />
    ),
    playground: progressSpec,
  },
  skeleton: { Glyph: icon('minus'), playground: skeletonSpec },
  'thinking-indicator': { Glyph: matrix(thinkingPatterns.thinking), playground: thinkingSpec },
  'agent-activity': { Glyph: matrix(thinkingPatterns.generating), playground: activitySpec },
  'tool-call-card': { Glyph: matrix(thinkingPatterns.tool), playground: toolCallSpec },
  'approval-gate': { Glyph: icon('shield'), playground: approvalSpec },
  'ai-sources': { Glyph: icon('link'), playground: sourcesSpec },
  'streaming-markdown': { Glyph: matrix(thinkingPatterns.streaming), playground: markdownSpec },
  'generative-card': { Glyph: icon('file'), playground: cardSpec },
  'response-actions': { Glyph: icon('copy'), playground: actionsSpec },
  ...Object.fromEntries(
    Object.entries(games).map(([slug, { definition, Loader }]) => {
      const component = catalog.find((e) => e.slug === slug)!.component;
      return [
        slug,
        {
          Glyph: matrix(definition.pattern),
          playground: gameSpec(component, slug, Loader, definition.controls),
        },
      ];
    }),
  ),
};

export type Item = CatalogEntry & {
  Glyph: Glyph;
  playground: PlaygroundSpec;
  props: PropDoc[];
  controls?: string;
};

export const items: Item[] = catalog.map((entry) => {
  const r = runtime[entry.slug];
  if (!r) throw new Error(`No runtime registered for ${entry.slug}`);
  return {
    ...entry,
    ...r,
    props: entry.game ? gameProps : (propsFor[entry.slug] ?? []),
    controls: games[entry.slug]?.definition.controls,
  };
});

export const findItem = (slug: string) => items.find((i) => i.slug === slug);
