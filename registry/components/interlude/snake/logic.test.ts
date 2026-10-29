import { describe, expect, it } from 'vite-plus/test';
import { createRng } from '../core/random';
import {
  COLS,
  createSnake,
  placeFood,
  ROWS,
  step,
  stepInterval,
  turn,
  wrapDelta,
  type SnakeState,
} from './logic';

const rng = () => createRng(1);
const at = (
  state: SnakeState,
  snake: { x: number; y: number }[],
  food = { x: 0, y: 0 },
): SnakeState => ({
  ...state,
  snake,
  prev: snake,
  food,
});

describe('snake', () => {
  it('moves one cell in its direction', () => {
    const s = createSnake(rng());
    const next = step({ ...s, food: { x: 0, y: 0 } }, rng());
    expect(next.snake[0]).toEqual({ x: 5, y: s.snake[0]!.y });
    expect(next.snake).toHaveLength(3);
  });

  it('ignores reversing and duplicate turns, buffers up to two', () => {
    const s = createSnake(rng());
    expect(turn(s, 'left')).toBe(s);
    expect(turn(s, 'right')).toBe(s);
    const queued = turn(turn(turn(s, 'up'), 'left'), 'down');
    expect(queued.queue).toEqual(['up', 'left']);
  });

  it('grows and scores when eating', () => {
    const s = at(
      createSnake(rng()),
      [
        { x: 2, y: 2 },
        { x: 1, y: 2 },
      ],
      { x: 3, y: 2 },
    );
    const next = step(s, rng());
    expect(next.score).toBe(1);
    expect(next.snake).toHaveLength(3);
    expect(next.snake.some((p) => p.x === next.food.x && p.y === next.food.y)).toBe(false);
  });

  it('wraps through every wall', () => {
    const right = at(createSnake(rng()), [
      { x: COLS - 1, y: 0 },
      { x: COLS - 2, y: 0 },
    ]);
    const next = step(right, rng());
    expect(next.over).toBe(false);
    expect(next.snake[0]).toEqual({ x: 0, y: 0 });
    const up = {
      ...at(createSnake(rng()), [
        { x: 3, y: 0 },
        { x: 3, y: 1 },
      ]),
      dir: 'up' as const,
    };
    expect(step(up, rng()).snake[0]).toEqual({ x: 3, y: ROWS - 1 });
    expect(wrapDelta(COLS - 1, 0, COLS)).toBe(1);
    expect(wrapDelta(0, COLS - 1, COLS)).toBe(-1);
  });

  it('dies on itself but may follow its own tail', () => {
    const loop = [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ];
    const s = { ...at(createSnake(rng()), loop), dir: 'up' as const, queue: ['right' as const] };
    expect(step(s, rng()).over).toBe(true);
    const chase = [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: 2 },
    ];
    const t = { ...at(createSnake(rng()), chase), dir: 'up' as const, queue: ['right' as const] };
    expect(step(t, rng()).over).toBe(false);
  });

  it('wins when the board is full', () => {
    const all = Array.from({ length: COLS * ROWS }, (_, i) => ({
      x: i % COLS,
      y: Math.floor(i / COLS),
    }));
    expect(placeFood(all, rng())).toBeNull();
  });

  it('speeds up with score, with a floor', () => {
    expect(stepInterval(10, 1)).toBeLessThan(stepInterval(0, 1));
    expect(stepInterval(1000, 1)).toBe(70);
    expect(stepInterval(0, 2)).toBe(stepInterval(0, 1) / 2);
  });
});
