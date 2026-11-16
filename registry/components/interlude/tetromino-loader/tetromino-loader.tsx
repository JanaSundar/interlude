import { motion, useTransform, type MotionValue } from 'motion/react';
import { LoaderFrame, type StatusLoaderProps } from '../primitives/loader-frame';
import { useLoop } from '../primitives/loop';
import { clampSpeed } from '../primitives/motion';
import { FULL_PHASE, pieceFrame, PIECES, TETROMINO_PERIOD, WELL, type Piece } from './pieces';

const GAP = 0.08;
const WELL_CELLS = Array.from({ length: WELL * WELL }, (_, i) => [i % WELL, Math.floor(i / WELL)]);

const Cell = ({ col, row }: { col: number; row: number }) => (
  <rect x={col + GAP} y={row + GAP} width={1 - GAP * 2} height={1 - GAP * 2} rx="0.16" />
);

const Cells = ({ piece }: { piece: Piece }) =>
  piece.cells.map(([col, row]) => <Cell key={`${col}-${row}`} col={col} row={row} />);

/** Four pieces fall into a small well, fill it, and clear. */
export function TetrominoLoader({ size = 18, speed, ...frame }: StatusLoaderProps) {
  return (
    <LoaderFrame {...frame}>
      {(reduced) => (
        // The svg clips to the well, so pieces enter over its top edge.
        <svg
          aria-hidden
          viewBox={`0 0 ${WELL} ${WELL}`}
          width={size}
          height={size}
          className="shrink-0 overflow-hidden"
        >
          <g fill="currentColor" opacity="0.12">
            {WELL_CELLS.map(([col, row]) => (
              <Cell key={`${col}-${row}`} col={col!} row={row!} />
            ))}
          </g>
          {reduced ? (
            PIECES.map((piece, i) => (
              <g key={i} fill="var(--il-accent)" opacity={pieceFrame(FULL_PHASE, i).opacity}>
                <Cells piece={piece} />
              </g>
            ))
          ) : (
            <Falling period={TETROMINO_PERIOD / clampSpeed(speed)} />
          )}
        </svg>
      )}
    </LoaderFrame>
  );
}

function Falling({ period }: { period: number }) {
  // One clock for every piece; nothing here re-renders React while it runs.
  const phase = useLoop(period);
  return PIECES.map((piece, i) => <FallingPiece key={i} piece={piece} index={i} phase={phase} />);
}

function FallingPiece({
  piece,
  index,
  phase,
}: {
  piece: Piece;
  index: number;
  phase: MotionValue<number>;
}) {
  const frame = useTransform(phase, (p) => pieceFrame(p, index));
  // CSS transforms on SVG elements are in user units, i.e. cells here.
  const y = useTransform(frame, (f) => -f.rise);
  const opacity = useTransform(frame, (f) => f.opacity);
  return (
    <motion.g fill="var(--il-accent)" style={{ y, opacity }}>
      <Cells piece={piece} />
    </motion.g>
  );
}
