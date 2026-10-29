import { breakoutPattern } from '@registry/components/interlude/breakout/pattern';
import { dinoPattern } from '@registry/components/interlude/dino-run/pattern';
import { ripplePattern } from '@registry/components/interlude/dot-matrix-loader/pattern';
import { fallingBlocksPattern } from '@registry/components/interlude/falling-blocks/pattern';
import { memoryPattern } from '@registry/components/interlude/memory-match/pattern';
import { mergePattern } from '@registry/components/interlude/merge-2048/pattern';
import { pongPattern } from '@registry/components/interlude/pong/pattern';
import type { DotPattern } from '@registry/components/interlude/primitives/dot-matrix';
import { reactionPattern } from '@registry/components/interlude/reaction-test/pattern';
import { slidingPattern } from '@registry/components/interlude/sliding-puzzle/pattern';
import { snakePattern } from '@registry/components/interlude/snake/pattern';
import { shooterPattern } from '@registry/components/interlude/space-shooter/pattern';
import { thinkingPatterns } from '@registry/components/interlude/thinking-indicator/patterns';
import { whackPattern } from '@registry/components/interlude/whack-a-mole/pattern';
import { catalog, REPO } from '@registry/catalog';
import { OG_DOCS, OG_HOME } from './names';

/** What an Open Graph card shows. `art` is the dot animation frozen on one frame. */
export type OgSpec = {
  eyebrow: string;
  title: string;
  /** A second, muted run of the title, like the site's headline. */
  muted?: string;
  description: string;
  command: string;
  art?: DotPattern;
};

/** The dot animation that stands for each component; those without one use the ripple. */
const patterns: Record<string, DotPattern> = {
  'thinking-indicator': thinkingPatterns.thinking,
  'agent-activity': thinkingPatterns.generating,
  'tool-call-card': thinkingPatterns.tool,
  'streaming-markdown': thinkingPatterns.streaming,
  snake: snakePattern,
  'falling-blocks': fallingBlocksPattern,
  pong: pongPattern,
  breakout: breakoutPattern,
  'merge-2048': mergePattern,
  'memory-match': memoryPattern,
  'whack-a-mole': whackPattern,
  'space-shooter': shooterPattern,
  'sliding-puzzle': slidingPattern,
  'dino-run': dinoPattern,
  'reaction-test': reactionPattern,
};

const installCommand = (slug: string) => `pnpm dlx shadcn@latest add ${REPO}/${slug}`;

/** Pure: the card for a name: `home`, `docs`, or a component slug. Null when there is none. */
export function ogSpec(name: string): OgSpec | null {
  if (name === OG_HOME) {
    return {
      eyebrow: 'Open-source React registry',
      title: 'Components for the',
      muted: 'in-between.',
      description:
        'Loaders that wait honestly, with games inside, and AI components that show what an agent actually did.',
      command: installCommand('<item>'),
    };
  }
  if (name === OG_DOCS) {
    return {
      eyebrow: 'Documentation',
      title: 'Interlude',
      muted: 'docs.',
      description:
        'Install one component at a time, wire it to your agent events, and make it yours.',
      command: installCommand('<item>'),
      art: ripplePattern,
    };
  }
  const entry = catalog.find((e) => e.slug === name);
  if (!entry) return null;
  return {
    eyebrow: `Component · ${entry.group}`,
    title: entry.name,
    description: entry.description,
    command: installCommand(entry.slug),
    art: patterns[entry.slug] ?? ripplePattern,
  };
}
