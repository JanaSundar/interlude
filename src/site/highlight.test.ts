import { describe, expect, it } from 'vite-plus/test';
import { tokenize, toLines } from './highlight';

const join = (code: string, lang?: 'tsx' | 'sh' | 'css') =>
  tokenize(code, lang)
    .map((t) => t.text)
    .join('');

describe('tokenize', () => {
  it('never changes the text', () => {
    const samples = [
      `import { X } from '@/x';\n\n<X status={s} label="Hi" /> // done`,
      'const a = `t${1}`; /* c */ fn(2n)',
      'unterminated "string',
      '<',
    ];
    for (const s of samples) expect(join(s)).toBe(s);
    expect(join('pnpm dlx shadcn@latest add a/b', 'sh')).toBe('pnpm dlx shadcn@latest add a/b');
    expect(join(':root {\n  --x: oklch(0.5 0 0);\n}', 'css')).toBe(
      ':root {\n  --x: oklch(0.5 0 0);\n}',
    );
  });

  it('colours by role', () => {
    const kinds = (code: string) =>
      Object.fromEntries(tokenize(code).map((t) => [t.text.trim(), t.kind]));
    const k = kinds(`import { A } from 'a';\n<A label="x" onDone={run()} />`);
    expect(k.import).toBe('keyword');
    expect(k["'a'"]).toBe('string');
    expect(k['<A']).toBe('tag');
    expect(k.label).toBe('prop');
    expect(k.run).toBe('fn');
  });

  it('splits multi-line tokens into lines', () => {
    const lines = toLines(tokenize('/* a\nb */\nx'));
    expect(lines).toHaveLength(3);
    expect(lines[1]![0]).toEqual({ kind: 'comment', text: 'b */' });
  });
});
