import { describe, expect, it } from 'vite-plus/test';
import { rubberband, snapToStep } from './slider';

describe('snapToStep', () => {
  it('snaps to the nearest step without floating-point noise', () => {
    expect(snapToStep(0.737, 0.5, 2, 0.25)).toBe(0.75);
    expect(snapToStep(0.3, 0, 1, 0.1)).toBe(0.3);
    expect(snapToStep(1830, 100, 20000, 100)).toBe(1800);
  });

  it('clamps to the range', () => {
    expect(snapToStep(-5, 0, 1, 0.01)).toBe(0);
    expect(snapToStep(9, 0.5, 2, 0.25)).toBe(2);
  });
});

describe('rubberband', () => {
  it('resists more the further it is pulled, and never passes the drag', () => {
    const near = rubberband(20, 240);
    const far = rubberband(200, 240);
    expect(near).toBeGreaterThan(0);
    expect(near).toBeLessThan(20);
    expect(far / 200).toBeLessThan(near / 20);
    expect(rubberband(-40, 240)).toBe(-rubberband(40, 240));
    expect(rubberband(0, 240)).toBe(0);
  });
});
