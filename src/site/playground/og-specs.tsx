import { useEffect, useRef, useState } from 'react';
import {
  OG_HEIGHT,
  OG_WIDTH,
  OgCard,
  type OgTemplateName,
} from '@registry/components/interlude/og-templates/og-templates';
import { importLine, jsx } from './jsx';
import type { PlaygroundSpec, Values } from './playground';
import { cx } from '../ui';
import { accentControl, appearance, appearanceCode, isStill, snippet } from './shared';

const text = (v: Values[string] | undefined) => String(v ?? '').trim() || undefined;

/** A full-size card scaled down to the width it is given. */
function Scaled({ values: v }: { values: Values }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / OG_WIDTH);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      role="img"
      aria-label={`Link preview: ${String(v.title)}`}
      className={cx(
        'relative overflow-hidden rounded-[10px] border border-line',
        // A grid card gives its preview no width to fill, so it gets a fixed one there.
        isStill(v) || v.hint === false ? 'w-[19rem]' : 'w-full max-w-xl',
      )}
      style={{ aspectRatio: `${OG_WIDTH} / ${OG_HEIGHT}` }}
    >
      {scale > 0 && (
        <div
          aria-hidden
          className="absolute top-0 left-0 origin-top-left text-left"
          style={{ transform: `scale(${scale})`, lineHeight: 'normal', letterSpacing: 'normal' }}
        >
          <OgCard
            template={v.template as OgTemplateName}
            title={String(v.title)}
            muted={text(v.muted)}
            description={text(v.description)}
            eyebrow="Open Graph"
            tag={text(v.tag)}
            tagline={text(v.tagline)}
            command={text(v.command)}
            brand={text(v.brand)}
            accent={appearance(v).accent}
          />
        </div>
      )}
    </div>
  );
}

export const ogSpec: PlaygroundSpec = {
  controls: [
    {
      type: 'choice',
      key: 'template',
      label: 'template',
      options: ['poster', 'terminal', 'arcade', 'bento'],
    },
    { type: 'text', key: 'title', label: 'title' },
    { type: 'text', key: 'muted', label: 'muted', placeholder: 'none' },
    { type: 'text', key: 'description', label: 'description', placeholder: 'none' },
    { type: 'text', key: 'tag', label: 'tag', placeholder: 'none' },
    { type: 'text', key: 'tagline', label: 'tagline', placeholder: 'none' },
    { type: 'text', key: 'command', label: 'command', placeholder: 'none' },
    { type: 'text', key: 'brand', label: 'brand', placeholder: 'none' },
    accentControl,
  ],
  defaults: {
    template: 'poster',
    title: 'Ship it',
    muted: 'on Friday.',
    description: 'A deploy checklist that fits on one screen, for teams that like their weekends.',
    tag: 'Guide',
    tagline: 'Nine steps',
    command: 'npx acme deploy --prod',
    brand: 'acme',
    accent: 'default',
  },
  examples: [
    { title: 'Poster', description: 'Warm paper and one oversized headline.', values: {} },
    {
      title: 'Terminal',
      description: 'A terminal window with the title at the prompt.',
      values: { template: 'terminal' },
    },
    {
      title: 'Arcade',
      description: 'The accent edge to edge, with a tilted screen.',
      values: { template: 'arcade' },
    },
    {
      title: 'Bento',
      description: 'Rounded tiles, each holding one fact.',
      values: { template: 'bento' },
    },
  ],
  Preview: Scaled,
  code: (v) =>
    snippet(
      importLine(['OgCard'], 'og-templates'),
      jsx('OgCard', {
        template: v.template === 'poster' ? undefined : v.template,
        title: String(v.title),
        muted: text(v.muted),
        description: text(v.description),
        tag: text(v.tag),
        tagline: text(v.tagline),
        command: text(v.command),
        brand: text(v.brand),
        accent: appearanceCode(v).accent,
      }),
    ),
  note: 'Drawn here by the browser at 1200×630 and scaled down · Takumi renders the same JSX to a PNG.',
};
