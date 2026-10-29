import { describe, expect, it } from 'vite-plus/test';
import { loopPhase, wave } from './loop';
import { formatJson, safeUrl } from './safe';
import { isSettled, resolveTask, statusKind, toActivityStatus } from './status';

describe('status vocabulary', () => {
  it('maps task and activity statuses onto shared kinds', () => {
    expect(statusKind('loading')).toBe('active');
    expect(statusKind('running')).toBe('active');
    expect(statusKind('completed')).toBe('success');
    expect(statusKind('failed')).toBe('error');
    expect(isSettled('cancelled')).toBe(true);
    expect(isSettled('waiting')).toBe(false);
  });

  it('treats unknown activity statuses as pending rather than guessing success', () => {
    expect(toActivityStatus('done')).toBe('pending');
    expect(toActivityStatus(undefined)).toBe('pending');
    expect(toActivityStatus('failed')).toBe('failed');
  });

  it('resolves a boolean into a task status', () => {
    expect(resolveTask(undefined, true)).toBe('loading');
    expect(resolveTask(undefined, false)).toBe('idle');
    expect(resolveTask('error', true)).toBe('error');
  });
});

describe('formatJson', () => {
  it('redacts sensitive keys at any depth, case-insensitively', () => {
    const out = formatJson({ query: 'q', auth: { apiKey: 'sk-123', Token: 't' } });
    expect(out).not.toContain('sk-123');
    expect(out).not.toContain('"t"');
    expect(out).toContain('"query": "q"');
  });

  it('never throws on cycles, bigint or functions', () => {
    const a: Record<string, unknown> = { n: 10n, f: () => 1 };
    a.self = a;
    const out = formatJson(a);
    expect(out).toContain('[circular]');
    expect(out).toContain('10n');
    expect(out).toContain('[function]');
  });

  it('passes strings through unchanged', () => {
    expect(formatJson('plain <b>text</b>')).toBe('plain <b>text</b>');
  });
});

describe('safeUrl', () => {
  it('allows http(s) and mailto only', () => {
    expect(safeUrl('https://example.com/a')?.href).toBe('https://example.com/a');
    expect(safeUrl('mailto:a@b.co')).not.toBeNull();
    expect(safeUrl('javascript:alert(1)')).toBeNull();
    expect(safeUrl('data:text/html,hi')).toBeNull();
    expect(safeUrl('/relative')).toBeNull();
    expect(safeUrl(42)).toBeNull();
  });
});

describe('loop clock', () => {
  it('cycles through [0, 1) and wraps, including negative offsets', () => {
    expect(loopPhase(0, 2)).toBe(0);
    expect(loopPhase(1, 2)).toBe(0.5);
    expect(loopPhase(5, 2)).toBe(0.5);
    expect(loopPhase(-0.5, 2)).toBe(0.75);
  });

  it('waves smoothly from 0 to 1 and back', () => {
    expect(wave(0)).toBeCloseTo(0);
    expect(wave(0.5)).toBeCloseTo(1);
    expect(wave(1)).toBeCloseTo(0);
  });
});
