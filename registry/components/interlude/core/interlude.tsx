import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { cx } from '../primitives/cx';
import { LiveRegion } from '../primitives/live-region';
import { clampSpeed, softSpring, useReducedPreference } from '../primitives/motion';
import { TaskResult } from '../primitives/task-result';
import { themeVars } from '../primitives/tokens';
import { GameView } from './game-view';
import { resolveTask, taskMessage, type GameEvent } from './lifecycle';
import { LoaderView } from './loader-view';
import type { GameDefinition, InterludeProps } from './types';
import { useInterlude } from './use-interlude';

export function Interlude({
  definition,
  status,
  active,
  label,
  size = 20,
  accent,
  speed: rawSpeed,
  reducedMotion = 'user',
  discovered,
  onDiscoveredChange,
  result,
  hint = false,
  seed,
  className,
}: InterludeProps & { definition: GameDefinition }) {
  const task = resolveTask(status, active);
  const { game, view, send } = useInterlude({ task, discovered, onDiscoveredChange });
  const reduced = useReducedPreference(reducedMotion);
  const speed = clampSpeed(rawSpeed);
  const layoutId = `il-dots-${useId()}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef(false);
  const focusGame = useRef(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage(taskMessage(task, label));
  }, [task, label]);

  // If the player was focused inside the game when the task ended, keep focus
  // on the component (the result) instead of dropping it to <body>.
  const resultRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (view === 'result' && rootRef.current?.contains(document.activeElement)) {
      resultRef.current?.focus({ preventScroll: true });
    }
  }, [view]);

  const sendWithFocus = useCallback(
    (event: GameEvent) => {
      if (event.type === 'dismiss') {
        returnFocus.current = true;
        focusGame.current = false;
      }
      send(event);
    },
    [send],
  );

  if (view === 'none') return null;

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <motion.div
        ref={rootRef}
        // Position only: a full layout animation scales the box between
        // loader and game sizes, which stretches the label text.
        layout="position"
        transition={softSpring}
        data-interlude=""
        data-task={task}
        data-game={game}
        style={themeVars(accent)}
        className={cx(
          'relative max-w-full',
          view === 'game' ? 'block w-[min(100%,21rem)]' : 'inline-block',
          className,
        )}
      >
        <LiveRegion message={message} />
        <AnimatePresence mode="popLayout" initial={false}>
          {view === 'loader' && (
            <LoaderView
              key="loader"
              layoutId={layoutId}
              pattern={definition.pattern}
              name={definition.name}
              label={label}
              size={size}
              speed={speed}
              reduced={reduced}
              hint={hint}
              autoFocus={returnFocus.current}
              onDiscover={() => {
                returnFocus.current = false;
                focusGame.current = true;
                send({ type: 'discover' });
              }}
            />
          )}
          {view === 'game' && (
            <GameView
              key="game"
              layoutId={layoutId}
              definition={definition}
              label={label}
              game={game}
              send={sendWithFocus}
              speed={speed}
              reduced={reduced}
              seed={seed}
              announce={setMessage}
              autoFocus={focusGame.current}
            />
          )}
          {view === 'result' && (
            <motion.div
              key="result"
              ref={resultRef}
              tabIndex={-1}
              className="outline-none"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {typeof result === 'function'
                ? result(task)
                : (result ?? <TaskResult status={task} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  );
}

/** Build a ready-to-use loader component from a game definition. */
export function createLoader(definition: GameDefinition) {
  function Loader(props: InterludeProps) {
    return <Interlude {...props} definition={definition} />;
  }
  Loader.displayName = `${definition.name.replace(/[^a-z0-9]/gi, '')}Loader`;
  return Loader;
}
