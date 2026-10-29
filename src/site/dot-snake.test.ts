import { describe, expect, it } from 'vite-plus/test';
import { createRng } from '@registry/components/interlude/core/random';
import { createSnake } from '@registry/components/interlude/snake/logic';
import { snakeCells } from './dot-snake';

const size = { cols: 17, rows: 7 };

describe('snakeCells', () => {
  const state = createSnake(createRng(3), size);
  const cells = snakeCells(state, size);

  it('covers every cell of the grid', () => {
    expect(cells).toHaveLength(size.cols * size.rows);
  });

  it('draws the snake in the accent colour, head largest, and one food dot', () => {
    const accent = cells.filter((c) => c.tone === 'accent');
    expect(accent).toHaveLength(state.snake.length);
    const head = state.snake[0]!;
    expect(cells[head.y * size.cols + head.x]!.weight).toBeGreaterThan(1);
    expect(cells.filter((c) => c.tone === 'ink')).toHaveLength(1);
  });

  it('tapers towards the tail', () => {
    const [head, , tail] = state.snake.map((p) => cells[p.y * size.cols + p.x]!.weight);
    expect(head!).toBeGreaterThan(tail!);
  });
});
