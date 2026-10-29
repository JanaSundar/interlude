import { motion, MotionConfig, useReducedMotionConfig, useTransform } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cx } from '../primitives/cx';
import { LiveRegion } from '../primitives/live-region';
import { useLoop, wave } from '../primitives/loop';
import { useReducedPreference, type ReducedMotion } from '../primitives/motion';
import { themeVars } from '../primitives/tokens';
import { parseMarkdown, type Inline, type MdBlock } from './parse';
import { Collapsible } from '../primitives/collapsible';

export type StreamingMarkdownProps = {
  /** Everything received so far. Pass the growing string; it is re-parsed safely each time. */
  content: string;
  /** True while more text may arrive. Shows a caret and marks the region busy. */
  streaming?: boolean;
  /** Set when the stream was stopped early, so the text is labelled incomplete. */
  stopped?: boolean;
  accent?: string;
  reducedMotion?: ReducedMotion;
  className?: string;
};

export function StreamingMarkdown({
  content,
  streaming = false,
  stopped = false,
  accent,
  reducedMotion,
  className,
}: StreamingMarkdownProps) {
  const blocks = useMemo(() => parseMarkdown(content), [content]);
  const reduced = useReducedPreference(reducedMotion);
  const announcement = useEndAnnouncement(streaming, stopped);

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <div
        aria-busy={streaming}
        style={themeVars(accent)}
        className={cx('flex flex-col gap-3 text-[14px] leading-relaxed', className)}
      >
        <LiveRegion message={announcement} />
        {blocks.map((block, i) => (
          <BlockView key={i} block={block} caret={streaming && i === blocks.length - 1} />
        ))}
        {streaming && blocks.length === 0 && <Caret />}
        <Collapsible open={stopped && !streaming}>
          <p className="font-mono text-[11px] opacity-45">Response stopped before it finished.</p>
        </Collapsible>
      </div>
    </MotionConfig>
  );
}

/** Announces only the end of a stream, never individual tokens. */
function useEndAnnouncement(streaming: boolean, stopped: boolean) {
  const was = useRef(streaming);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (was.current && !streaming) setMessage(stopped ? 'Response stopped' : 'Response complete');
    if (streaming) setMessage('');
    was.current = streaming;
  }, [streaming, stopped]);
  return message;
}

function Caret() {
  // Reads the surrounding MotionConfig: under reduced motion the caret holds still.
  const still = useReducedMotionConfig();
  const phase = useLoop(1);
  const opacity = useTransform(phase, (p) => (still ? 1 : 1 - 0.85 * wave(p)));
  return (
    <motion.span
      aria-hidden
      className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] rounded-full bg-(--il-accent)"
      style={{ opacity }}
    />
  );
}

function BlockView({ block, caret }: { block: MdBlock; caret: boolean }) {
  const tail = caret ? <Caret /> : null;
  switch (block.type) {
    case 'heading': {
      const Tag = (['h3', 'h4', 'h5'] as const)[block.level - 1]!;
      return (
        <Tag
          className={cx(
            'font-semibold tracking-tight',
            block.level === 1 ? 'text-lg' : 'text-base',
          )}
        >
          <Inlines nodes={block.inline} />
          {tail}
        </Tag>
      );
    }
    case 'paragraph':
      return (
        <p>
          <Inlines nodes={block.inline} />
          {tail}
        </p>
      );
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        <List
          className={cx('flex flex-col gap-1 pl-5', block.ordered ? 'list-decimal' : 'list-disc')}
        >
          {block.items.map((item, i) => (
            <li key={i}>
              <Inlines nodes={item} />
              {i === block.items.length - 1 && tail}
            </li>
          ))}
        </List>
      );
    }
    case 'quote':
      return (
        <blockquote className="border-l-2 border-current/20 pl-3 opacity-75">
          <Inlines nodes={block.inline} />
          {tail}
        </blockquote>
      );
    case 'code':
      return (
        <figure className="overflow-hidden rounded-[10px] bg-current/[0.05]">
          {block.lang && (
            <figcaption className="border-b border-current/[0.07] px-3 py-1 font-mono text-[10px] opacity-50">
              {block.lang}
            </figcaption>
          )}
          <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed">
            <code>{block.text}</code>
            {tail}
          </pre>
        </figure>
      );
    case 'rule':
      return <hr className="border-current/10" />;
  }
}

function Inlines({ nodes }: { nodes: Inline[] }): ReactNode {
  return nodes.map((node, i) => {
    switch (node.type) {
      case 'text':
        return node.text;
      case 'code':
        return (
          <code
            key={i}
            className="rounded-[4px] bg-current/[0.07] px-1 py-px font-mono text-[0.88em]"
          >
            {node.text}
          </code>
        );
      case 'strong':
        return (
          <strong key={i} className="font-semibold">
            <Inlines nodes={node.children} />
          </strong>
        );
      case 'em':
        return (
          <em key={i}>
            <Inlines nodes={node.children} />
          </em>
        );
      case 'link':
        return node.href ? (
          <a
            key={i}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-(color:--il-accent) underline decoration-current/30 underline-offset-2 hover:decoration-current"
          >
            <Inlines nodes={node.children} />
          </a>
        ) : (
          <span key={i}>
            <Inlines nodes={node.children} />
          </span>
        );
    }
  });
}
