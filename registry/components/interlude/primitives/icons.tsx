/** 16px line icons on one grid and stroke weight. Paths only, no icon dependency. */
const paths = {
  check: 'M3.5 8.5l3 3 6-7',
  x: 'M4.5 4.5l7 7M11.5 4.5l-7 7',
  alert: 'M8 4.5v4M8 11.2v.1M8 1.8l6.5 11.4H1.5z',
  minus: 'M4.5 8h7',
  pause: 'M6 4.5v7M10 4.5v7',
  chevron: 'M6 4l4 4-4 4',
  copy: 'M5.5 5.5V3h7.5v7.5h-2.5M3 5.5h7.5V13H3z',
  refresh: 'M13 3.5v3h-3M3 12.5v-3h3M12.6 6.5A5 5 0 0 0 3.6 6M3.4 9.5a5 5 0 0 0 9 .5',
  edit: 'M10.5 3l2.5 2.5-7 7H3.5V10z',
  play: 'M5 3.5v9l7-4.5z',
  arrow: 'M3 8h10M9 4l4 4-4 4',
  external: 'M9 3h4v4M13 3L7.5 8.5M11.5 9.5V13H3V4.5h3.5',
  search: 'M7 11.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM10.3 10.3L13.5 13.5',
  file: 'M4 1.8h5l3 3v9.4H4zM9 1.8v3h3',
  tool: 'M10 2.5a3 3 0 0 0-2.8 4L2.8 11a1.2 1.2 0 0 0 1.7 1.7l4.5-4.5a3 3 0 0 0 4-2.8l-1.8 1.8-1.7-.4-.4-1.7z',
  shield: 'M8 1.8l5 2v4c0 3-2.2 5.3-5 6.4-2.8-1.1-5-3.4-5-6.4v-4z',
  spark: 'M8 2v3M8 11v3M2 8h3M11 8h3M4 4l1.8 1.8M10.2 10.2L12 12M12 4l-1.8 1.8M5.8 10.2L4 12',
  user: 'M8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 14c.5-2.6 2.5-4 5-4s4.5 1.4 5 4',
  link: 'M7 9a2.8 2.8 0 0 0 4 0l2-2a2.8 2.8 0 0 0-4-4l-.8.8M9 7a2.8 2.8 0 0 0-4 0l-2 2a2.8 2.8 0 0 0 4 4l.8-.8',
  dot: 'M8 8h.01',
  menu: 'M2.5 4.5h11M2.5 8h11M2.5 11.5h11',
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = 'size-3.5' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={paths[name]} />
    </svg>
  );
}
