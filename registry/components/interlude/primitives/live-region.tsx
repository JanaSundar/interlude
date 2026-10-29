/**
 * Visually hidden announcement. Pass only meaningful, infrequent changes
 * (a new step, a finished task), never per-frame or per-token text.
 */
export function LiveRegion({ message, urgent = false }: { message: string; urgent?: boolean }) {
  return (
    <span
      role={urgent ? 'alert' : 'status'}
      aria-live={urgent ? 'assertive' : 'polite'}
      className="sr-only"
    >
      {message}
    </span>
  );
}
