import { describe, expect, it } from 'vite-plus/test';
import { uploadProgress } from './simulated-upload';

describe('uploadProgress', () => {
  it('starts at zero, only moves forward, and reaches exactly 100%', () => {
    const values = Array.from({ length: 16 }, (_, i) => uploadProgress(i));
    expect(values[0]).toBe(0);
    values.slice(1).forEach((v, i) => expect(v).toBeGreaterThanOrEqual(values[i]!));
    expect(values.at(-1)).toBe(1);
    expect(Math.max(...values)).toBe(1);
  });

  it('holds at 100% briefly, then loops back to the start', () => {
    const firstDone = Array.from({ length: 40 }, (_, i) => i).find((i) => uploadProgress(i) === 1)!;
    expect(uploadProgress(firstDone + 2)).toBe(1);
    const restart = Array.from({ length: 40 }, (_, i) => i + firstDone).find(
      (i) => uploadProgress(i) === 0,
    )!;
    expect(restart).toBeGreaterThan(firstDone);
    expect(uploadProgress(restart + 3)).toBe(uploadProgress(3));
  });
});
