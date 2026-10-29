import type { ComponentType } from 'react';
import type { InterludeProps } from '@registry/components/interlude/core/types';
import type { StatusLoaderProps } from '@registry/components/interlude/primitives/loader-frame';
import { ProgressLoader } from '@registry/components/interlude/progress-loader/progress-loader';
import {
  Skeleton,
  SkeletonGroup,
  SkeletonText,
} from '@registry/components/interlude/skeleton/skeleton';
import { changed, expr, importLine, jsx } from './jsx';
import { useSimulatedUpload } from './simulated-upload';
import type { Control, PlaygroundSpec, Values } from './playground';
import {
  accentControl,
  appearance,
  appearanceCode,
  appearanceDefaults,
  asStatus,
  isStill,
  labelControl,
  motionControl,
  sizeControl,
  snippet,
  statusControl,
  times,
} from './shared';

const speedControl: Control = {
  type: 'range',
  key: 'speed',
  label: 'speed',
  min: 0.5,
  max: 2,
  step: 0.25,
  format: times,
};
/** Common props for status loaders, as passed and as written. */
const loaderProps = (v: Values) => ({
  status: asStatus(v),
  label: String(v.label) || undefined,
  size: Number(v.size),
  speed: Number(v.speed),
  ...appearance(v),
});
const loaderCode = (v: Values, componentDefaults: Values) =>
  changed(
    {
      status: v.status,
      label: String(v.label) || undefined,
      size: v.size,
      speed: v.speed,
      ...appearanceCode(v),
    },
    { speed: 1, ...componentDefaults },
  );

export function statusLoaderSpec(
  component: string,
  slug: string,
  Loader: ComponentType<StatusLoaderProps>,
  size: { initial: number; default: number; min: number; max: number },
): PlaygroundSpec {
  return {
    controls: [
      statusControl,
      labelControl('none'),
      sizeControl(size.min, size.max),
      speedControl,
      accentControl,
      motionControl,
    ],
    defaults: {
      status: 'loading',
      label: 'Uploading files',
      size: size.initial,
      speed: 1,
      ...appearanceDefaults,
    },
    examples: [
      { title: 'Default', values: {} },
      {
        title: 'Without a label',
        description: 'The indicator alone; the status is still announced.',
        values: { label: '' },
      },
      {
        title: 'Finished',
        description: 'A terminal status replaces the indicator immediately.',
        values: { status: 'success' },
      },
      { title: 'Custom accent', values: { accent: '#5b8cff' } },
    ],
    Preview: ({ values }) => <Loader {...loaderProps(values)} />,
    code: (v) =>
      snippet(importLine([component], slug), jsx(component, loaderCode(v, { size: size.default }))),
    note: 'Your app owns status. Terminal states replace the indicator immediately.',
  };
}

/** Simulated by default so the bar moves on its own; manual and unknown on request. */
function ProgressPreview({ values: v }: { values: Values }) {
  const still = isStill(v);
  const simulated = useSimulatedUpload(
    !still && v.progress === 'simulated' && v.status === 'loading',
  );
  // A resting card shows a representative mid-upload frame.
  const value =
    v.progress === 'simulated'
      ? still
        ? 0.62
        : simulated
      : v.progress === 'manual'
        ? Number(v.value)
        : null;
  return <ProgressLoader {...loaderProps(v)} value={value} showValue={!!v.showValue} />;
}

export const progressSpec: PlaygroundSpec = {
  controls: [
    statusControl,
    {
      type: 'choice',
      key: 'progress',
      label: 'progress',
      options: ['simulated', 'manual', 'unknown'],
    },
    {
      type: 'range',
      key: 'value',
      label: 'value (manual)',
      min: 0,
      max: 1,
      step: 0.01,
      format: (v) => `${Math.round(v * 100)}%`,
    },
    { type: 'toggle', key: 'showValue', label: 'showValue' },
    labelControl('none'),
    sizeControl(80, 320),
    speedControl,
    accentControl,
    motionControl,
  ],
  defaults: {
    status: 'loading',
    progress: 'simulated',
    value: 0.42,
    showValue: true,
    label: 'Uploading files',
    size: 200,
    speed: 1,
    ...appearanceDefaults,
  },
  examples: [
    {
      title: 'Known progress',
      description: 'Pass value and max from your upload or job.',
      values: { progress: 'manual', value: 0.42 },
    },
    {
      title: 'Unknown progress',
      description: 'Without a value the bar is honestly indeterminate.',
      values: { progress: 'unknown' },
    },
    { title: 'Bar only', values: { progress: 'manual', value: 0.7, showValue: false, label: '' } },
  ],
  Preview: ProgressPreview,
  code: (v) =>
    snippet(
      importLine(['ProgressLoader'], 'progress-loader'),
      jsx('ProgressLoader', {
        ...loaderCode(v, { size: 160 }),
        value: v.progress === 'unknown' ? undefined : expr('bytesSent'),
        max: v.progress === 'unknown' ? undefined : expr('totalBytes'),
        showValue: v.showValue || undefined,
      }),
    ),
  note: 'Simulated upload · switch progress to manual to drag it, or unknown for the indeterminate sweep.',
};

export const skeletonSpec: PlaygroundSpec = {
  controls: [
    { type: 'toggle', key: 'loading', label: 'loading' },
    { type: 'range', key: 'lines', label: 'lines', min: 1, max: 6, step: 1 },
    { type: 'toggle', key: 'avatar', label: 'avatar' },
    labelControl(),
    motionControl,
  ],
  defaults: {
    loading: true,
    lines: 3,
    avatar: true,
    label: 'Loading profile',
    reducedMotion: 'user',
  },
  examples: [
    { title: 'Profile', values: {} },
    { title: 'Text only', values: { avatar: false, lines: 4 } },
    {
      title: 'Loaded',
      description: 'When loading ends the content fades in and the height eases.',
      values: { loading: false },
    },
  ],
  Preview: ({ values: v }) => (
    <div className="w-full max-w-sm rounded-[14px] border border-line bg-bg/40 p-4">
      <SkeletonGroup
        loading={!!v.loading}
        label={String(v.label)}
        reducedMotion={appearance(v).reducedMotion}
        placeholder={
          <div className="flex gap-3">
            {v.avatar && <Skeleton shape="circle" className="size-10 shrink-0" />}
            <SkeletonText lines={Number(v.lines)} className="flex-1 pt-1" />
          </div>
        }
      >
        <div className="flex gap-3 text-sm">
          {v.avatar && (
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent font-semibold text-on-accent">
              A
            </span>
          )}
          <div>
            <p className="font-medium">Ada Lovelace</p>
            <p className="text-muted">Wrote the first algorithm intended for a machine, in 1843.</p>
          </div>
        </div>
      </SkeletonGroup>
    </div>
  ),
  code: (v) =>
    snippet(
      importLine(['Skeleton', 'SkeletonGroup', 'SkeletonText'], 'skeleton'),
      jsx(
        'SkeletonGroup',
        {
          loading: expr('isLoading'),
          label: String(v.label),
          reducedMotion: appearanceCode(v).reducedMotion,
          placeholder: expr(
            v.avatar
              ? `<><Skeleton shape="circle" /><SkeletonText lines={${v.lines}} /></>`
              : `<SkeletonText lines={${v.lines}} />`,
          ),
        },
        '<Profile user={user} />',
      ),
    ),
};

export function gameSpec(
  component: string,
  slug: string,
  Loader: ComponentType<InterludeProps>,
  controlsHint: string,
): PlaygroundSpec {
  return {
    controls: [
      statusControl,
      labelControl('none'),
      sizeControl(14, 40),
      speedControl,
      { type: 'toggle', key: 'hint', label: 'hint' },
      accentControl,
      motionControl,
    ],
    defaults: {
      status: 'loading',
      label: 'Generating your response',
      size: 24,
      speed: 1,
      hint: true,
      ...appearanceDefaults,
    },
    examples: [
      {
        title: 'Default',
        description: 'A quiet dot matrix; click it to play while you wait.',
        values: {},
      },
      { title: 'Larger', values: { size: 32 } },
      {
        title: 'Finished',
        description: 'Ending the task stops the game and shows the result.',
        values: { status: 'success' },
      },
    ],
    Preview: ({ values: v }) => <Loader {...loaderProps(v)} hint={!!v.hint} />,
    code: (v) =>
      snippet(
        importLine([component], slug),
        jsx(component, { ...loaderCode(v, { size: 20 }), hint: v.hint || undefined }),
      ),
    note: `Click the loader to play · ${controlsHint} · switch status to end the game`,
  };
}
