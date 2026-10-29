import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import { DotMatrixLoader } from '../dot-matrix-loader/dot-matrix-loader';
import { OrbitalLoader } from '../orbital-loader/orbital-loader';
import { orbitPoint, ORBITS } from '../orbital-loader/orbits';
import { PulseLoader } from '../pulse-loader/pulse-loader';
import { SkeletonGroup, SkeletonText } from '../skeleton/skeleton';
import { ThinkingIndicator } from '../thinking-indicator/thinking-indicator';
import { SWEEP_PERIOD, sweepOffset, toFraction } from './progress';
import { ProgressLoader } from './progress-loader';

const loaders = { DotMatrixLoader, OrbitalLoader, PulseLoader, ProgressLoader };

describe.each(Object.entries(loaders))('%s lifecycle', (_, Loader) => {
  it('renders nothing while idle', () => {
    const { container } = render(<Loader active={false} label="Uploading" />);
    expect(container.innerHTML).toBe('');
  });

  it('shows and announces the label while loading', () => {
    render(<Loader status="loading" label="Uploading" />);
    expect(screen.getByRole('status').textContent).toBe('Uploading');
  });

  it.each(['success', 'error', 'cancelled'] as const)('replaces the indicator on %s', (status) => {
    const { container, rerender } = render(<Loader status="loading" label="Uploading" />);
    rerender(<Loader status={status} label="Uploading" />);
    expect(container.querySelector('[data-task]')?.getAttribute('data-task')).toBe(status);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('renders a custom result', () => {
    render(<Loader status="success" result={(s) => <b>finished: {s}</b>} />);
    expect(screen.getByText('finished: success')).toBeTruthy();
  });
});

describe('ProgressLoader', () => {
  it('reports real progress and never invents it', () => {
    const { rerender } = render(<ProgressLoader status="loading" value={3} max={4} showValue />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('75');
    expect(screen.getByText('75%')).toBeTruthy();
    rerender(<ProgressLoader status="loading" />);
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false);
  });

  it('normalises unusable values to unknown', () => {
    expect(toFraction(Number.NaN)).toBeNull();
    expect(toFraction('50')).toBeNull();
    expect(toFraction(5, 0)).toBeNull();
    expect(toFraction(2)).toBe(1);
    expect(toFraction(-1)).toBe(0);
  });
});

describe('orbits', () => {
  it('stays on its radius', () => {
    for (const orbit of ORBITS) {
      const { x, y } = orbitPoint(orbit, 0.37);
      expect(Math.hypot(x, y)).toBeCloseTo(orbit.radius);
    }
  });
});

describe('SkeletonGroup', () => {
  it('exposes one busy status, then the content', () => {
    const { container, rerender } = render(
      <SkeletonGroup loading label="Loading profile" placeholder={<SkeletonText />}>
        <p>Ada</p>
      </SkeletonGroup>,
    );
    expect(screen.getByRole('status', { name: 'Loading profile' })).toBeTruthy();
    expect(container.firstElementChild!.getAttribute('aria-busy')).toBe('true');
    rerender(
      <SkeletonGroup loading={false} placeholder={<SkeletonText />}>
        <p>Ada</p>
      </SkeletonGroup>,
    );
    expect(screen.getByText('Ada')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });
});

describe('ThinkingIndicator', () => {
  it('describes observable states only, with tool names', () => {
    const { rerender } = render(<ThinkingIndicator state="tool" tool="web search" />);
    expect(screen.getByRole('status').textContent).toBe('Waiting for web search');
    rerender(<ThinkingIndicator state="completed" />);
    expect(screen.getByRole('status').textContent).toBe('Done');
    rerender(<ThinkingIndicator state="thinking" label="Planning the change" />);
    expect(screen.getByRole('status').textContent).toBe('Planning the change');
  });

  it('shows elapsed time only when a start time is supplied', () => {
    const { container, rerender } = render(
      <ThinkingIndicator state="thinking" variant="detailed" />,
    );
    expect(container.textContent).not.toMatch(/\ds/);
    rerender(
      <ThinkingIndicator state="thinking" variant="detailed" startedAt={Date.now() - 5000} />,
    );
    expect(container.textContent).toMatch(/5s/);
  });
});

describe('indeterminate sweep', () => {
  it('enters fully off the left, exits fully off the right, and loops', () => {
    expect(sweepOffset(0)).toBe(-100);
    expect(sweepOffset(SWEEP_PERIOD / 2)).toBeCloseTo(75);
    expect(sweepOffset(SWEEP_PERIOD * 0.999)).toBeGreaterThan(249);
    expect(sweepOffset(SWEEP_PERIOD * 3.25)).toBeCloseTo(sweepOffset(SWEEP_PERIOD * 0.25));
  });
});
