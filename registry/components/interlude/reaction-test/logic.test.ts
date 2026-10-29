import { describe, expect, it } from 'vite-plus/test';
import { createRng } from '../core/random';
import { average, best, createReaction, interrupt, press, randomDelay, signal } from './logic';

const rng = createRng(4);

describe('reaction test', () => {
  it('runs idle → waiting → go → result', () => {
    const waiting = press(createReaction(), 0, rng);
    expect(waiting.phase.kind).toBe('waiting');
    const go = signal(waiting, 1000);
    expect(go.phase).toEqual({ kind: 'go', shownAt: 1000 });
    const done = press(go, 1234.4, rng);
    expect(done.phase).toEqual({ kind: 'result', ms: 234 });
    expect(done.results).toEqual([234]);
  });

  it('flags a false start', () => {
    const early = press(press(createReaction(), 0, rng), 500, rng);
    expect(early.phase.kind).toBe('early');
    expect(early.results).toEqual([]);
  });

  it('randomises the wait within bounds', () => {
    for (let i = 0; i < 20; i++) {
      const d = randomDelay(rng);
      expect(d).toBeGreaterThanOrEqual(1200);
      expect(d).toBeLessThan(3800);
    }
  });

  it('voids a round that loses focus', () => {
    const waiting = press(createReaction(), 0, rng);
    expect(interrupt(waiting).phase.kind).toBe('idle');
  });

  it('summarises results', () => {
    expect(best([300, 250, 280])).toBe(250);
    expect(average([300, 250, 280])).toBe(277);
    expect(best([])).toBeNull();
  });
});
