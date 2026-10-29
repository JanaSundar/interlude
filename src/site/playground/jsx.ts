/**
 * Pure helpers that turn playground values into the JSX a developer would
 * write. Output is meant to be pasted, so it stays idiomatic and minimal.
 */
const EXPR = Symbol('expr');
export type Expr = { [EXPR]: string };

/** A prop whose value is code, e.g. expr('status') → status={status}. */
export const expr = (code: string): Expr => ({ [EXPR]: code });
const isExpr = (v: unknown): v is Expr => !!v && typeof v === 'object' && EXPR in v;

/** Literal JS for arrays, objects and primitives, single-quoted like the codebase. */
export function literal(value: unknown): string {
  if (isExpr(value)) return value[EXPR];
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (Array.isArray(value)) return `[${value.map(literal).join(', ')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(([k, v]) => `${k}: ${literal(v)}`);
    return entries.length ? `{ ${entries.join(', ')} }` : '{}';
  }
  return String(value);
}

function attr(name: string, value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (value === true) return name;
  if (typeof value === 'string' && !value.includes('"') && !value.includes('\n')) {
    return `${name}="${value}"`;
  }
  return `${name}={${literal(value)}}`;
}

/** <Name a="b" n={1} /> on one line when short, one prop per line otherwise. */
export function jsx(name: string, props: Record<string, unknown>, children?: string): string {
  const attrs = Object.entries(props)
    .map(([k, v]) => attr(k, v))
    .filter((a): a is string => a !== null);
  const inline = `<${name}${attrs.map((a) => ` ${a}`).join('')}`;
  const open =
    inline.length <= 72 ? inline : `<${name}\n${attrs.map((a) => `  ${a}`).join('\n')}\n`;
  const close = open.endsWith('\n') ? '' : ' ';
  if (children === undefined) return `${open}${close}/>`;
  const body = children
    .split('\n')
    .map((l) => (l ? `  ${l}` : l))
    .join('\n');
  return `${open}>\n${body}\n</${name}>`;
}

/** Drops props equal to the component's own default, so the snippet shows only what changed. */
export function changed(
  values: Record<string, unknown>,
  defaults: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values).filter(([k, v]) => !(k in defaults) || defaults[k] !== v),
  );
}

export const importLine = (names: string[], slug: string) =>
  `import { ${names.join(', ')} } from '@/components/interlude/${slug}/${slug}';`;
