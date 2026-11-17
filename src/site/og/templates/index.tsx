import type { ReactElement } from 'react';
import {
  ogTemplates,
  type OgTemplate,
} from '@registry/components/interlude/og-templates/og-templates';
import { ACCENT, mark } from '../../logo';
import { OG_DOCS, OG_HOME } from '../names';
import type { OgSpec } from '../spec';
import { Classic } from './classic';

type SiteTemplate = (props: { spec: OgSpec }) => ReactElement;

/** The Interlude mark, in the ink a design asks for. */
function Mark({ ink, signal }: { ink: string; signal: string }) {
  return (
    <svg viewBox={mark.viewBox} width={57} height={30}>
      <g
        fill="none"
        stroke={ink}
        strokeWidth={mark.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={mark.stem} />
        <path d={mark.wave} />
      </g>
      <circle cx={mark.dot.cx} cy={mark.dot.cy} r={mark.dot.r} fill={ink} />
      <circle cx={mark.signal.cx} cy={mark.signal.cy} r={mark.signal.r} fill={signal} />
    </svg>
  );
}

/** A registry design, branded for this site. `signal` colours the mark's last dot. */
const branded = (Template: OgTemplate, signal?: string): SiteTemplate =>
  function Branded({ spec }) {
    return Template({
      ...spec,
      brand: 'interlude',
      logo: (ink) => <Mark ink={ink} signal={signal ?? ink} />,
    });
  };

export const templates = {
  poster: branded(ogTemplates.poster),
  terminal: branded(ogTemplates.terminal, ACCENT),
  arcade: branded(ogTemplates.arcade, '#fff4e6'),
  bento: branded(ogTemplates.bento, ACCENT),
  classic: Classic,
} satisfies Record<string, SiteTemplate>;

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
