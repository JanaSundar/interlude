/** Small pure numeric helpers shared across primitives, loaders and games. */

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const clamp01 = (v: number) => clamp(v, 0, 1);
