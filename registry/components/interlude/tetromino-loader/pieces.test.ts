import { describe, expect, it } from 'vite-plus/test';
import { dropHeight, FULL_PHASE, pieceFrame, PIECES, WELL } from './pieces';

const id = ([col, row]: readonly [number, number]) => `${col},${row}`;

describe('tetromino pieces', () => {
  it('fills the well exactly, four cells a piece', () => {
    const cells = PIECES.flatMap((p) => p.cells.map(id));
    for (const piece of PIECES) expect(piece.cells).toHaveLength(4);
    expect(new Set(cells).size).toBe(WELL * WELL);
    for (const piece of PIECES)
      for (const [col, row] of piece.cells) {
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(WELL);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(WELL);
      }
  });

  it('keeps every piece in one connected shape', () => {
    for (const piece of PIECES) {
      const left = new Set(piece.cells.map(id));
      const queue = [piece.cells[0]!];
      left.delete(id(queue[0]!));
      while (queue.length) {
        const [col, row] = queue.pop()!;
        for (const next of [
          [col + 1, row],
          [col - 1, row],
          [col, row + 1],
          [col, row - 1],
        ] as const)
          if (left.delete(id(next))) queue.push(next);
      }
      expect(left.size).toBe(0);
    }
  });

  it('can drop each piece straight down past the ones already landed', () => {
    const landed = new Set<string>();
    for (const piece of PIECES) {
      for (const [col, row] of piece.cells)
        for (let above = 0; above < row; above++) expect(landed.has(id([col, above]))).toBe(false);
      for (const cell of piece.cells) landed.add(id(cell));
    }
  });

  it('starts each piece out of the well and lands them in order', () => {
    PIECES.forEach((piece, i) => {
      expect(pieceFrame(0, i).rise).toBe(dropHeight(piece));
      for (const [, row] of piece.cells) expect(row - dropHeight(piece)).toBeLessThan(0);
      expect(pieceFrame(FULL_PHASE, i)).toEqual({ rise: 0, opacity: piece.opacity });
    });
    let last = PIECES.map((_, i) => pieceFrame(0, i).rise);
    for (let p = 0; p <= FULL_PHASE; p += 0.005) {
      const now = PIECES.map((_, i) => pieceFrame(p, i).rise);
      now.forEach((rise, i) => {
        expect(Number.isInteger(rise)).toBe(true);
        expect(rise).toBeLessThanOrEqual(last[i]!);
        // A piece only moves once the one before it has landed.
        if (i > 0 && rise < dropHeight(PIECES[i]!)) expect(now[i - 1]).toBe(0);
      });
      last = now;
    }
  });

  it('flashes the full well, then clears it before the next cycle', () => {
    expect(pieceFrame(0.8, 3).opacity).toBe(1);
    expect(pieceFrame(0.95, 0).opacity).toBe(0);
    expect(pieceFrame(0.95, 0).rise).toBe(0);
  });
});
