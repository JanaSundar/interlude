/**
 * The rendering contract for structured AI results. Models produce JSON in
 * this shape; the card renders only these block types, as text. No HTML,
 * no scripts, no arbitrary components.
 */
export type Block =
  | { type: 'text'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'fields'; fields: { label: string; value: string }[] }
  | { type: 'metric'; label: string; value: string; note?: string }
  | { type: 'steps'; steps: { title: string; detail?: string; done?: boolean }[] }
  | { type: 'comparison'; columns: string[]; rows: { label: string; values: string[] }[] }
  | { type: 'callout'; tone: 'info' | 'warning' | 'success'; text: string };

export type CardKind = 'summary' | 'recommendation' | 'plan' | 'comparison' | 'info' | 'preview';

export type CardSpec = {
  kind: CardKind;
  title: string;
  subtitle?: string;
  blocks: Block[];
  /** Buttons that call back into your app with the action id. */
  actions?: { id: string; label: string }[];
};

export type ParseResult = { card: CardSpec | null; issues: string[] };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined);
const strs = (v: unknown) => (Array.isArray(v) ? v.map(str).filter((s) => s !== undefined) : []);
const objs = (v: unknown) => (Array.isArray(v) ? v.filter(isObj) : []);

const kinds: readonly string[] = [
  'summary',
  'recommendation',
  'plan',
  'comparison',
  'info',
  'preview',
];
const tones: readonly string[] = ['info', 'warning', 'success'];

/** Returns the block if it is complete enough to render honestly, otherwise null. */
function parseBlock(b: Obj): Block | null {
  switch (b.type) {
    case 'text': {
      const text = str(b.text);
      return text ? { type: 'text', text } : null;
    }
    case 'list': {
      const items = strs(b.items);
      return items.length ? { type: 'list', items, ordered: b.ordered === true } : null;
    }
    case 'fields': {
      const fields = objs(b.fields).flatMap((f) => {
        const label = str(f.label);
        const value = str(f.value) ?? (typeof f.value === 'number' ? String(f.value) : undefined);
        return label && value ? [{ label, value }] : [];
      });
      return fields.length ? { type: 'fields', fields } : null;
    }
    case 'metric': {
      const label = str(b.label);
      const value = str(b.value) ?? (typeof b.value === 'number' ? String(b.value) : undefined);
      return label && value ? { type: 'metric', label, value, note: str(b.note) } : null;
    }
    case 'steps': {
      const steps = objs(b.steps).flatMap((s) => {
        const title = str(s.title);
        return title ? [{ title, detail: str(s.detail), done: s.done === true }] : [];
      });
      return steps.length ? { type: 'steps', steps } : null;
    }
    case 'comparison': {
      const columns = strs(b.columns);
      const rows = objs(b.rows).flatMap((r) => {
        const label = str(r.label);
        // Pad short rows so a cell is visibly empty rather than shifted.
        const values = Array.isArray(r.values)
          ? columns.map((_, i) => str((r.values as unknown[])[i]) ?? '—')
          : [];
        return label && values.length ? [{ label, values }] : [];
      });
      return columns.length && rows.length ? { type: 'comparison', columns, rows } : null;
    }
    case 'callout': {
      const text = str(b.text);
      const tone = typeof b.tone === 'string' && tones.includes(b.tone) ? b.tone : 'info';
      return text ? { type: 'callout', tone: tone as 'info', text } : null;
    }
    default:
      return null;
  }
}

/**
 * Validates untrusted model output (an object or a JSON string). Invalid
 * blocks are skipped and reported; the card is null only when there is no
 * title or nothing renderable.
 */
export function parseCard(input: unknown): ParseResult {
  let value = input;
  if (typeof input === 'string') {
    try {
      value = JSON.parse(input);
    } catch {
      return { card: null, issues: ['Result is not valid JSON.'] };
    }
  }
  if (!isObj(value)) return { card: null, issues: ['Result is not an object.'] };
  const issues: string[] = [];
  const title = str(value.title);
  if (!title) issues.push('Missing title.');
  const rawBlocks = Array.isArray(value.blocks) ? value.blocks : [];
  const blocks: Block[] = [];
  rawBlocks.forEach((raw, i) => {
    const block = isObj(raw) ? parseBlock(raw) : null;
    if (block) blocks.push(block);
    else
      issues.push(
        `Block ${i + 1} was skipped (${isObj(raw) ? String(raw.type) : 'not an object'}).`,
      );
  });
  if (!title || blocks.length === 0) {
    if (blocks.length === 0) issues.push('No renderable blocks.');
    return { card: null, issues };
  }
  const actions = objs(value.actions).flatMap((a) => {
    const id = str(a.id);
    const label = str(a.label);
    return id && label ? [{ id, label }] : [];
  });
  const kind = typeof value.kind === 'string' && kinds.includes(value.kind) ? value.kind : 'info';
  return {
    card: { kind: kind as CardKind, title, subtitle: str(value.subtitle), blocks, actions },
    issues,
  };
}
