import { safeUrl } from '../primitives/safe';

/**
 * A deliberately small Markdown subset, parsed to a typed tree and rendered
 * as React elements. Raw HTML is never interpreted; it shows as text. The
 * parser is tolerant of half-written input, which is the normal case while
 * a response streams in.
 */
export type Inline =
  | { type: 'text'; text: string }
  | { type: 'code'; text: string }
  | { type: 'strong'; children: Inline[] }
  | { type: 'em'; children: Inline[] }
  | { type: 'link'; href: string | null; children: Inline[] };

export type MdBlock =
  | { type: 'heading'; level: 1 | 2 | 3; inline: Inline[] }
  | { type: 'paragraph'; inline: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] }
  | { type: 'quote'; inline: Inline[] }
  | { type: 'code'; lang: string; text: string; open: boolean }
  | { type: 'rule' };

const INLINE =
  /`([^`]+)`|\*\*(.+?)\*\*|(?<!\w)\*([^*\s][^*]*?)\*(?!\w)|(?<!\w)_([^_\s][^_]*?)_(?!\w)|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push({ type: 'text', text: text.slice(last, m.index) });
    const [, code, strong, star, under, label, url] = m;
    if (code !== undefined) out.push({ type: 'code', text: code });
    else if (strong !== undefined) out.push({ type: 'strong', children: parseInline(strong) });
    else if ((star ?? under) !== undefined)
      out.push({ type: 'em', children: parseInline((star ?? under)!) });
    else
      out.push({
        type: 'link',
        href: safeUrl(url)?.href ?? null,
        children: parseInline(label ?? ''),
      });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
  return out;
}

const FENCE = /^\s*```\s*([\w+-]*)\s*$/;
const HEADING = /^(#{1,3})\s+(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const RULE = /^\s*(?:-{3,}|\*{3,})\s*$/;

export function parseMarkdown(source: string): MdBlock[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: MdBlock[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length)
      blocks.push({ type: 'paragraph', inline: parseInline(paragraph.join(' ')) });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const fence = FENCE.exec(line);
    if (fence) {
      flush();
      const body: string[] = [];
      let closed = false;
      for (i++; i < lines.length; i++) {
        if (FENCE.test(lines[i]!)) {
          closed = true;
          break;
        }
        body.push(lines[i]!);
      }
      blocks.push({ type: 'code', lang: fence[1] ?? '', text: body.join('\n'), open: !closed });
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      flush();
      const level = heading[1]!.length as 1 | 2 | 3;
      blocks.push({ type: 'heading', level, inline: parseInline(heading[2]!) });
      continue;
    }
    if (RULE.test(line)) {
      flush();
      blocks.push({ type: 'rule' });
      continue;
    }
    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    if (bullet || numbered) {
      flush();
      const ordered = !!numbered;
      const item = parseInline((bullet ?? numbered)![1]!);
      const prev = blocks.at(-1);
      if (prev?.type === 'list' && prev.ordered === ordered) prev.items.push(item);
      else blocks.push({ type: 'list', ordered, items: [item] });
      continue;
    }
    const quote = QUOTE.exec(line);
    if (quote) {
      flush();
      const prev = blocks.at(-1);
      const inline = parseInline(quote[1]!);
      if (prev?.type === 'quote') prev.inline.push({ type: 'text', text: ' ' }, ...inline);
      else blocks.push({ type: 'quote', inline });
      continue;
    }
    paragraph.push(line.trim());
  }
  flush();
  return blocks;
}
