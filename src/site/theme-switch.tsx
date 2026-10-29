import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { softSpring, spring } from '@registry/components/interlude/primitives/motion';
import { useTint } from '@registry/components/interlude/primitives/tint';

/** Runs before paint. Dark is the default; a stored "light" choice wins. */
export const themeScript = `try{document.documentElement.classList.toggle('dark',localStorage.getItem('theme')!=='light')}catch(e){}`;

const SUN =
  'M8 5.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9';
const MOON = 'M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8z';

function Glyph({ path, className }: { path: string; className?: string }) {
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
      <path d={path} />
    </svg>
  );
}

/** Knob travel: track width − borders − padding − knob. */
const TRAVEL = 52 - 2 - 4 - 22;

/**
 * Theme as a real switch: sun and moon wait at either end of the track,
 * the knob springs across carrying the active one, and stretches toward
 * where it's going while pressed.
 */
export function ThemeSwitch() {
  const [dark, setDark] = useState(true);
  const { style, ...tint } = useTint({ hover: 5, press: 9 });
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // Storage unavailable; the choice still applies for this visit.
    }
  };

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark theme"
      onClick={toggle}
      {...tint}
      style={style}
      whileTap="pressed"
      className="relative h-7 w-[52px] shrink-0 rounded-full border border-line-strong p-0.5 text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      {/* Resting icons at each end; the one under the knob fades out. */}
      <motion.span
        className="absolute top-1/2 left-[7px] -translate-y-1/2"
        animate={{ opacity: dark ? 0.55 : 0 }}
        transition={spring}
      >
        <Glyph path={SUN} className="size-3" />
      </motion.span>
      <motion.span
        className="absolute top-1/2 right-[7px] -translate-y-1/2"
        animate={{ opacity: dark ? 0 : 0.55 }}
        transition={spring}
      >
        <Glyph path={MOON} className="size-3" />
      </motion.span>
      <motion.span
        className="relative grid size-[22px] place-items-center rounded-full bg-raised text-accent shadow-[0_1px_3px_rgb(0_0_0/0.3),0_0_0_0.5px_rgb(0_0_0/0.08)] dark:bg-fg/[0.16]"
        initial={false}
        animate={{ x: dark ? TRAVEL : 0 }}
        style={{ originX: dark ? 1 : 0 }}
        variants={{ pressed: { scaleX: 1.18 } }}
        transition={softSpring}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={dark ? 'moon' : 'sun'}
            initial={{ opacity: 0, rotate: dark ? -90 : 90, scale: 0.4 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: dark ? 90 : -90, scale: 0.4 }}
            transition={spring}
            className="grid place-items-center"
          >
            <Glyph path={dark ? MOON : SUN} className="size-3" />
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}
