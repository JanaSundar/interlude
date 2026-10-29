import { useEffect, useRef, useState } from 'react';
import { directionFromKey, type Direction } from '@registry/components/interlude/core/input';
import { createRng, randomSeed } from '@registry/components/interlude/core/random';
import { useGameLoop } from '@registry/components/interlude/core/use-game-loop';
import {
  createSnake,
  step,
  stepInterval,
  turn,
  type Size,
  type SnakeState,
} from '@registry/components/interlude/snake/logic';
import type { Cell } from './dot-text';

/**
 * Pure: Snake drawn onto a dot grid, row by row. The snake is accent-coloured
 * and tapers towards the tail; the food is a single ink dot.
 */
export function snakeCells(state: SnakeState, { cols, rows }: Size): Cell[] {
  const cells: Cell[] = Array.from({ length: cols * rows }, () => ({ tone: 'off', weight: 1 }));
  const at = (p: { x: number; y: number }) => p.y * cols + p.x;
  cells[at(state.food)] = { tone: 'ink', weight: 0.8 };
  const last = Math.max(1, state.snake.length - 1);
  state.snake.forEach((p, i) => {
    cells[at(p)] = { tone: 'accent', weight: i === 0 ? 1.2 : 1 - 0.4 * (i / last) };
  });
  return cells;
}

/**
 * Snake on a fixed-size dot grid. State lives in a ref and steps on the
 * shared fixed-timestep loop; React only re-renders once per step.
 */
export function useDotSnake(size: Size, active: boolean) {
  const rng = useRef(createRng(randomSeed()));
  const state = useRef(createSnake(rng.current, size));
  const [view, setView] = useState({ state: state.current, best: 0 });

  const commit = () =>
    setView((v) => ({ state: state.current, best: Math.max(v.best, state.current.score) }));
  const restart = () => {
    state.current = createSnake(rng.current, size);
    commit();
  };
  const steer = (dir: Direction) => {
    state.current = turn(state.current, dir);
  };

  // Each time the game is opened it starts fresh.
  useEffect(() => {
    if (active) restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useGameLoop(
    {
      update: () => {
        state.current = step(state.current, rng.current, size);
        commit();
      },
      render: () => {},
    },
    stepInterval(view.state.score, 1),
    active && !view.state.over,
  );

  return { state: view.state, best: view.best, steer, restart };
}

/** Arrow and WASD steering while the game is open; R or Enter restarts after a loss. */
export function useDotSnakeKeys({
  active,
  over,
  steer,
  restart,
  exit,
}: {
  active: boolean;
  over: boolean;
  steer: (dir: Direction) => void;
  restart: () => void;
  exit: () => void;
}) {
  const latest = useRef({ over, steer, restart, exit });
  latest.current = { over, steer, restart, exit };
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const { over: lost, steer: go, restart: again, exit: out } = latest.current;
      if (e.key === 'Escape') return out();
      if (lost && (e.key === 'r' || e.key === 'R' || e.key === 'Enter')) {
        e.preventDefault();
        return again();
      }
      const dir = directionFromKey(e.key);
      if (dir) {
        e.preventDefault();
        go(dir);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);
}
