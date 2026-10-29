/**
 * A tiny, pure tokenizer for the TSX, CSS and shell snippets on this site.
 * Not a parser: it colours by role and never changes the text, so joining
 * the tokens always gives back the input.
 */
export type TokenKind =
  | 'comment'
  | 'string'
  | 'keyword'
  | 'tag'
  | 'number'
  | 'fn'
  | 'prop'
  | 'plain';

export type Token = { kind: TokenKind; text: string };
export type Lang = 'tsx' | 'sh' | 'css' | 'text';

const KEYWORDS =
  'import|from|export|default|const|let|var|function|return|if|else|async|await|type|interface|new|true|false|null|undefined|as|try|catch|finally|for|of|in|while|typeof|extends|satisfies|useState|useEffect';

const tsxRules: [TokenKind, RegExp][] = [
  ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
  ['string', /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/y],
  ['tag', /<\/?[A-Z][\w.]*|<\/?[a-z][\w-]*(?=[\s/>])/y],
  ['keyword', new RegExp(`\\b(?:${KEYWORDS})\\b`, 'y')],
  ['number', /\b\d[\d_.]*n?\b/y],
  ['fn', /[A-Za-z_$][\w$]*(?=\s*\()/y],
  ['prop', /[A-Za-z_$][\w$-]*(?==[{"'])/y],
  ['plain', /[A-Za-z_$][\w$]*|\s+|./y],
];

const shRules: [TokenKind, RegExp][] = [
  ['comment', /#[^\n]*/y],
  ['fn', /^(?:pnpm|npx|yarn|bunx|npm)\b/y],
  ['keyword', /\b(?:dlx|add|install|--bun)\b/y],
  ['string', /[\w@.-]+\/[\w@./-]+/y],
  ['plain', /\s+|[^\s]+/y],
];

const cssRules: [TokenKind, RegExp][] = [
  ['comment', /\/\*[\s\S]*?\*\//y],
  ['tag', /[.:#]?[a-z][\w-]*(?=\s*\{)/y],
  ['prop', /--?[a-z][\w-]*(?=\s*:)/y],
  ['fn', /[a-z-]+(?=\()/y],
  ['number', /\b\d[\d.]*(?:%|px|rem)?/y],
  ['plain', /\s+|./y],
];

const rules: Record<Lang, [TokenKind, RegExp][]> = {
  tsx: tsxRules,
  sh: shRules,
  css: cssRules,
  text: [['plain', /[\s\S]+/y]],
};

export function tokenize(code: string, lang: Lang = 'tsx'): Token[] {
  const out: Token[] = [];
  let at = 0;
  while (at < code.length) {
    let matched = false;
    for (const [kind, re] of rules[lang]) {
      re.lastIndex = at;
      const m = re.exec(code);
      if (!m || m[0].length === 0) continue;
      const prev = out.at(-1);
      if (prev && prev.kind === kind) prev.text += m[0];
      else out.push({ kind, text: m[0] });
      at += m[0].length;
      matched = true;
      break;
    }
    if (!matched) {
      out.push({ kind: 'plain', text: code[at]! });
      at++;
    }
  }
  return out;
}

/** Splits tokens into lines, cutting tokens that span a newline. */
export function toLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const t of tokens) {
    t.text.split('\n').forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines.at(-1)!.push({ kind: t.kind, text: part });
    });
  }
  return lines;
}
