import { clamp01 } from '../primitives/math';
import { ease } from '../primitives/patterns';

/** One closed line of the kolam, in dot units: dots sit on whole numbers. */
export type Strand = {
  /** SVG path data for the closed loop. */
  d: string;
  /** How many times the loop passes a point where two lines cross. */
  crossings: number;
};

/** How far a line swings out as it turns around an edge dot or a corner dot. */
const EDGE_REACH = 0.6;
const CORNER_REACH = 1;

/** Space the loops need beyond the outermost dots, in dot units. */
export const KOLAM_MARGIN = 0.75;

/**
 * Pure: the lines of a kolam around a `cols` × `rows` grid of dots.
 *
 * Lines run diagonally, crossing halfway between neighbouring dots, and loop
 * around every dot on the border, so each dot ends up enclosed without being
 * touched. A grid whose sides share no factor gives one unbroken line; a
 * square one gives as many loops as it has dots on a side.
 */
export function kolamStrands(cols: number, rows: number): Strand[] {
  const isDot = (x: number, y: number) => x >= 0 && x < cols && y >= 0 && y < rows;
  /** Lines cross at the midpoint between two neighbouring dots. */
  const isCrossing = (x: number, y: number) =>
    Number.isInteger(x)
      ? !Number.isInteger(y) && isDot(x, y - 0.5) && isDot(x, y + 0.5)
      : Number.isInteger(y) && isDot(x - 0.5, y) && isDot(x + 0.5, y);

  const strands: Strand[] = [];
  const seen = new Set<string>();
  const key = (x: number, y: number, dx: number, dy: number) => `${x},${y},${dx * dy}`;

  for (let y = 0; y <= rows - 1; y += 0.5) {
    for (let x = 0; x <= cols - 1; x += 0.5) {
      for (const startDy of [1, -1]) {
        if (!isCrossing(x, y) || seen.has(key(x, y, 1, startDy))) continue;
        let at = { x, y, dx: 1, dy: startDy };
        let d = `M${x} ${y}`;
        let crossings = 0;
        do {
          seen.add(key(at.x, at.y, at.dx, at.dy));
          crossings++;
          const next = step(at, isCrossing);
          d += next.segment;
          at = next;
        } while (at.x !== x || at.y !== y || at.dx !== 1 || at.dy !== startDy);
        strands.push({ d: `${d}Z`, crossings });
      }
    }
  }
  return strands;
}

type Heading = { x: number; y: number; dx: number; dy: number };

/** Pure: from one crossing to the next, straight on or around a border dot. */
function step(
  { x, y, dx, dy }: Heading,
  isCrossing: (x: number, y: number) => boolean,
): Heading & { segment: string } {
  const nx = x + dx / 2;
  const ny = y + dy / 2;
  if (isCrossing(nx, ny)) return { x: nx, y: ny, dx, dy, segment: `L${nx} ${ny}` };

  // No crossing ahead: the line has reached the border and turns around a dot.
  const alongRow = !Number.isInteger(x);
  // An edge dot is rounded in a quarter turn, to the crossing on its far side.
  const edge = alongRow ? { x: nx + dx / 2, y, dx, dy: -dy } : { x, y: ny + dy / 2, dx: -dx, dy };
  // A corner dot has no far side, so the line swings all the way around it.
  const corner = alongRow
    ? { x: nx, y: y - dy / 2, dx: -dx, dy: -dy }
    : { x: x - dx / 2, y: ny, dx: -dx, dy: -dy };
  const isEdge = isCrossing(edge.x, edge.y);
  const exit = isEdge ? edge : corner;
  const reach = isEdge ? EDGE_REACH : CORNER_REACH;
  const segment = `C${x + dx * reach} ${y + dy * reach} ${exit.x - exit.dx * reach} ${
    exit.y - exit.dy * reach
  } ${exit.x} ${exit.y}`;
  return { ...exit, segment };
}

/** Dots on each side of the default kolam. */
export const KOLAM_DOTS = 3;
export const KOLAM_PERIOD = 3.6;

/** Fractions of the cycle: how long one loop takes to draw, and the gap between loops. */
const DRAW = 0.3;
const STAGGER = 0.07;
const ERASE_AT = 0.52;

/**
 * Pure: the stretch of a loop that is drawn at `phase`, as fractions of its
 * length. Each loop is drawn from its start, rests, then is lifted from the
 * same end, the way a kolam is laid down in one motion.
 */
export function strandSpan(phase: number, index: number): { from: number; to: number } {
  const at = (start: number) => ease(clamp01((phase - start - index * STAGGER) / DRAW));
  return { from: at(ERASE_AT), to: at(0) };
}
