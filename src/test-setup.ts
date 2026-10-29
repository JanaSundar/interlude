import { cleanup } from '@testing-library/react';
import { afterEach } from 'vite-plus/test';

// jsdom has no canvas or matchMedia; games handle a missing 2D context.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as typeof HTMLCanvasElement.prototype.getContext;
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;

afterEach(cleanup);
