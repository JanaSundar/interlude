import { DotMatrix, type DotPattern } from '../primitives/dot-matrix';
import { LoaderFrame, type StatusLoaderProps } from '../primitives/loader-frame';
import { clampSpeed } from '../primitives/motion';
import { ripplePattern } from './pattern';

export type DotMatrixLoaderProps = StatusLoaderProps & {
  /** Any pure dot pattern; defaults to a diagonal ripple. */
  pattern?: DotPattern;
};

/** The understated default: a small dot matrix that ripples while your task runs. */
export function DotMatrixLoader({
  pattern = ripplePattern,
  size = 16,
  speed,
  ...frame
}: DotMatrixLoaderProps) {
  return (
    <LoaderFrame {...frame}>
      {(reduced) => (
        <DotMatrix pattern={pattern} size={size} speed={clampSpeed(speed)} reduced={reduced} />
      )}
    </LoaderFrame>
  );
}
