import { OgArcade } from './arcade';
import { OgBento } from './bento';
import { OgPoster } from './poster';
import type { OgCardProps, OgTemplate } from './shared';
import { OgTerminal } from './terminal';

export { OgArcade, OgBento, OgPoster, OgTerminal };
export { OG_ACCENT, OG_HEIGHT, OG_WIDTH, type OgCardProps, type OgTemplate } from './shared';

/** The four designs by name. */
export const ogTemplates = {
  poster: OgPoster,
  terminal: OgTerminal,
  arcade: OgArcade,
  bento: OgBento,
} satisfies Record<string, OgTemplate>;

export type OgTemplateName = keyof typeof ogTemplates;

/**
 * A 1200×630 link-preview card in one of four designs. Plain JSX with inline
 * styles and no hooks, so an image renderer such as Takumi can draw it to a
 * PNG, and a browser can show the same card as a preview.
 */
export function OgCard({
  template = 'poster',
  ...card
}: OgCardProps & { template?: OgTemplateName }) {
  return ogTemplates[template](card);
}
