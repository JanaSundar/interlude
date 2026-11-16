import { OG_DOCS, OG_HOME } from '../names';
import type { OgSpec } from '../spec';
import { Arcade } from './arcade';
import { Bento } from './bento';
import { Classic } from './classic';
import { Poster } from './poster';
import type { OgTemplate } from './shared';
import { Terminal } from './terminal';

export const templates = {
  poster: Poster,
  terminal: Terminal,
  arcade: Arcade,
  bento: Bento,
  classic: Classic,
} satisfies Record<string, OgTemplate>;

export type TemplateName = keyof typeof templates;

export const isTemplate = (name: string): name is TemplateName => Object.hasOwn(templates, name);

/**
 * Pure: the design a card uses unless one is asked for. The home page gets the
 * poster, the docs the terminal, games the arcade cabinet, everything else the
 * bento grid.
 */
export function templateFor(name: string, spec: OgSpec): TemplateName {
  if (name === OG_HOME) return 'poster';
  if (name === OG_DOCS) return 'terminal';
  return spec.tag === 'Playable' ? 'arcade' : 'bento';
}
