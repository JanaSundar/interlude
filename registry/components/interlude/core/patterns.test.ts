import { describe, expect, it } from 'vite-plus/test';
import { breakoutPattern } from '../breakout/pattern';
import { fallingBlocksPattern } from '../falling-blocks/pattern';
import { memoryPattern } from '../memory-match/pattern';
import { mergePattern } from '../merge-2048/pattern';
import { pongPattern } from '../pong/pattern';
import { reactionPattern } from '../reaction-test/pattern';
import { slidingPattern } from '../sliding-puzzle/pattern';
import { snakePattern } from '../snake/pattern';
import { shooterPattern } from '../space-shooter/pattern';
import { whackPattern } from '../whack-a-mole/pattern';
import { phaseDistance, pulse, REST } from '../primitives/patterns';

const patterns = {
  snakePattern,
  fallingBlocksPattern,
  pongPattern,
  breakoutPattern,
  mergePattern,
  memoryPattern,
  whackPattern,
  shooterPattern,
  slidingPattern,
  reactionPattern,
};

describe('loader patterns', () => {
  for (const [name, pattern] of Object.entries(patterns)) {
    it(`${name} yields valid frames across the cycle`, () => {
      let lit = 0;
      for (let step = 0; step < 100; step++) {
        const phase = step / 100;
        for (let row = 0; row < pattern.rows; row++) {
          for (let col = 0; col < pattern.cols; col++) {
            const f = pattern.frame(phase, col, row);
            expect(f.o).toBeGreaterThanOrEqual(0);
            expect(f.o).toBeLessThanOrEqual(1);
            expect(
              Number.isFinite(f.s ?? 1) && Number.isFinite(f.x ?? 0) && Number.isFinite(f.y ?? 0),
            ).toBe(true);
            if (f.o > REST + 0.3) lit++;
          }
        }
      }
      // Something must visibly move, or it isn't a loader.
      expect(lit).toBeGreaterThan(0);
    });
  }
});

describe('pattern helpers', () => {
  it('wraps phase distance around the cycle', () => {
    expect(phaseDistance(0.95, 0.05)).toBeCloseTo(0.1);
    expect(pulse(0.98, 0.02, 0.1)).toBeGreaterThan(0.5);
    expect(pulse(0.5, 0, 0.1)).toBe(0);
  });
});
