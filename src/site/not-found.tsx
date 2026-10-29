import { useMemo, useState } from 'react';
import { Hud } from '@registry/components/interlude/core/game-ui';
import { useSwipe } from '@registry/components/interlude/core/input';
import { SectionLabel } from './chrome';
import { CELL, DotGrid } from './dot-grid';
import { snakeCells, useDotSnake, useDotSnakeKeys } from './dot-snake';
import { dotText, textCells } from './dot-text';
import { ButtonLink } from './ui';
import { useSecretWord } from './use-secret';

/** The glyph that glows in the accent colour, and doubles as the secret door. */
const ACCENT_GLYPH = 1;
const GLYPH_COLS = 5;
const GLYPH_STRIDE = GLYPH_COLS + 1;

/**
 * The 404 page, in character: the number is a dot matrix. Click the glowing
 * zero (or type "snake") and the same dots become a Snake board; nothing on
 * the page says so.
 */
export function NotFound() {
  const text = useMemo(() => dotText('404'), []);
  const size = { cols: text.cols, rows: text.rows };
  const idle = useMemo(() => textCells(text, ACCENT_GLYPH), [text]);

  const [playing, setPlaying] = useState(false);
  const open = () => setPlaying(true);
  const close = () => setPlaying(false);
  useSecretWord('snake', open);

  const game = useDotSnake(size, playing);
  const { over, score } = game.state;
  useDotSnakeKeys({ active: playing, over, steer: game.steer, restart: game.restart, exit: close });
  const swipe = useSwipe(game.steer, () => over && game.restart());

  return (
    <section className="page grid min-h-[calc(100dvh-14rem)] place-items-center py-20">
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <DotGrid
          cols={size.cols}
          rows={size.rows}
          label={playing ? 'Snake' : '404'}
          cells={playing ? snakeCells(game.state, size) : idle}
          {...(playing ? swipe : {})}
        >
          {/* The easter egg: the glowing zero is a door. Nothing about it says so. */}
          {!playing && (
            <rect
              x={ACCENT_GLYPH * GLYPH_STRIDE * CELL}
              y={0}
              width={GLYPH_COLS * CELL}
              height={size.rows * CELL}
              fill="transparent"
              onClick={open}
            />
          )}
        </DotGrid>

        {/* Keyboard and screen-reader way in; invisible until focused. */}
        {!playing && (
          <button
            type="button"
            onClick={open}
            className="sr-only mt-3 rounded-full border border-line-strong bg-raised px-3 py-1 font-mono text-[11px] text-muted focus:not-sr-only"
          >
            Play a hidden game
          </button>
        )}

        {/* Reserved, so opening the game never moves the page. */}
        <div className="mt-4 flex h-12 flex-col items-center justify-center gap-1.5">
          {playing && (
            <>
              <Hud
                items={[
                  { label: 'score', value: score },
                  { label: 'best', value: game.best },
                ]}
              />
              <p className="font-mono text-[10px] text-faint">
                {over ? 'game over · R or tap to restart' : 'arrows / WASD or swipe'} · esc to exit
              </p>
            </>
          )}
        </div>

        <SectionLabel index="404" className="mt-6">
          Page not found
        </SectionLabel>
        <h1 className="mt-5 text-[clamp(2rem,6vw,3.25rem)] leading-none font-semibold tracking-[-0.04em]">
          Nothing is <span className="whitespace-nowrap text-faint">loading here.</span>
        </h1>
        <p className="mt-4 max-w-md text-muted">
          This page doesn’t exist, or it moved. We checked, honestly, and nothing is on its way.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <ButtonLink to="/" variant="solid">
            Back to the start
          </ButtonLink>
          <ButtonLink to="/docs/components">Browse components</ButtonLink>
        </div>
      </div>
    </section>
  );
}
