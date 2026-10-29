/** 5×7 dot-matrix glyphs, one string per row; `#` is a lit dot. */
const GLYPHS: Record<string, readonly string[]> = {
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
};

export type Dot = { x: number; y: number; lit: boolean; glyph: number };

/** What one cell of a dot grid shows: unlit, plain, or in the accent colour. */
export type Tone = 'off' | 'ink' | 'accent';
export type Cell = { tone: Tone; /** Size relative to a lit dot. */ weight: number };

/**
 * Pure: lays text out as a grid of dots, glyphs separated by one blank column.
 * Every cell is returned (lit or not) so the unlit ones can render as a faint field.
 */
export function dotText(text: string): { cols: number; rows: number; dots: Dot[] } {
  const glyphs = text.split('').map((c) => GLYPHS[c]);
  const rows = 7;
  const dots: Dot[] = [];
  let col = 0;
  glyphs.forEach((glyph, g) => {
    if (!glyph) throw new Error(`No dot-matrix glyph for "${text[g]}"`);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < 5; x++) {
        dots.push({ x: col + x, y, lit: glyph[y]![x] === '#', glyph: g });
      }
    }
    col += 6;
  });
  return { cols: Math.max(0, col - 1), rows, dots };
}

/**
 * Pure: the text as one cell per grid position, row by row. Lit dots in the
 * `accentGlyph`-th glyph take the accent colour; the gaps between glyphs stay unlit.
 */
export function textCells(
  { cols, rows, dots }: ReturnType<typeof dotText>,
  accentGlyph: number,
): Cell[] {
  const cells: Cell[] = Array.from({ length: cols * rows }, () => ({ tone: 'off', weight: 1 }));
  for (const d of dots) {
    if (d.lit)
      cells[d.y * cols + d.x] = { tone: d.glyph === accentGlyph ? 'accent' : 'ink', weight: 1 };
  }
  return cells;
}
