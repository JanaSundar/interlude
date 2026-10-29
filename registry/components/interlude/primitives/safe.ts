/**
 * Pretty-prints untrusted values for display. Never throws: handles cycles,
 * bigint, functions and undefined, and masks values under sensitive keys.
 */
export const DEFAULT_REDACT = ['password', 'secret', 'token', 'apiKey', 'api_key', 'authorization'];

export function formatJson(value: unknown, redact: readonly string[] = DEFAULT_REDACT): string {
  if (typeof value === 'string') return value;
  const hidden = new Set(redact.map((k) => k.toLowerCase()));
  const seen = new WeakSet<object>();
  try {
    const out = JSON.stringify(
      value,
      (key, v: unknown) => {
        if (key && hidden.has(key.toLowerCase())) return '••••••';
        if (typeof v === 'bigint') return `${v}n`;
        if (typeof v === 'function') return '[function]';
        if (v && typeof v === 'object') {
          if (seen.has(v)) return '[circular]';
          seen.add(v);
        }
        return v;
      },
      2,
    );
    return out ?? String(value);
  } catch {
    return '[unrenderable value]';
  }
}

/** Only http(s) and mailto links are rendered as links; everything else is text. */
export function safeUrl(raw: unknown): URL | null {
  if (typeof raw !== 'string') return null;
  try {
    const url = new URL(raw);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}
