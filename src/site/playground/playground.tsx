import { useState, type ComponentType } from 'react';
import { CodeTabs } from '../code';
import { Button } from '../ui';
import {
  ActionRow,
  Choice,
  Group,
  Row,
  Slider,
  Swatches,
  Switch,
  TextField,
  WideRow,
} from './controls';

export type Control =
  | { type: 'choice'; key: string; label: string; options: readonly string[] }
  | { type: 'text'; key: string; label: string; placeholder?: string }
  | {
      type: 'range';
      key: string;
      label: string;
      min: number;
      max: number;
      step: number;
      format?: (v: number) => string;
    }
  | { type: 'toggle'; key: string; label: string }
  | { type: 'color'; key: string; label: string }
  /** A button that bumps a counter, for replays and one-off events. */
  | { type: 'action'; key: string; label: string };

export type Values = Record<string, string | number | boolean>;

export type PlaygroundSpec = {
  controls: Control[];
  defaults: Values;
  Preview: ComponentType<{ values: Values }>;
  /** Pure: the JSX for the current values. */
  code: (values: Values) => string;
  /** One line under the stage, e.g. what drives the preview. */
  note?: string;
  /** Named presets shown as docs examples; each overrides the defaults. */
  examples?: Example[];
};

export type Example = { title: string; description?: string; values: Partial<Values> };

/** Pure: an example's full values, layered over the playground defaults. */
export const exampleValues = (spec: PlaygroundSpec, example: Example): Values =>
  ({ ...spec.defaults, ...example.values }) as Values;

/** Live preview, props panel and generated code for one registry item. */
export function Playground({
  spec,
  example,
  slug,
}: {
  spec: PlaygroundSpec;
  example: string;
  slug: string;
}) {
  const [values, setValues] = useState<Values>(spec.defaults);
  const [round, setRound] = useState(0);
  const set = (key: string, value: Values[string]) => setValues((v) => ({ ...v, [key]: value }));
  const reset = () => {
    setValues(spec.defaults);
    setRound((r) => r + 1);
  };
  const { Preview } = spec;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid overflow-hidden rounded-panel border border-line bg-raised lg:grid-cols-[1fr_19rem]">
        <div className="flex min-w-0 flex-col">
          <div className="stage-grid grid min-h-[22rem] flex-1 grid-cols-[minmax(0,1fr)] place-items-center p-6 sm:p-10">
            <Preview key={round} values={values} />
          </div>
          {spec.note && (
            <p className="border-t border-line px-4 py-2.5 font-mono text-[11px] text-faint">
              {spec.note}
            </p>
          )}
        </div>
        <aside
          aria-label="Props"
          className="flex flex-col border-t border-line lg:border-t-0 lg:border-l"
        >
          <div className="flex h-11 items-center justify-between border-b border-line pr-1.5 pl-4">
            <h3 className="text-[13px] font-medium">Props</h3>
            <Button variant="ghost" size="sm" onClick={reset} className="text-accent">
              Reset
            </Button>
          </div>
          <div className="flex flex-col gap-4 p-3 lg:max-h-[32rem] lg:overflow-y-auto">
            {groupControls(spec.controls).map((group) => (
              <Group key={group.title ?? 'props'} title={group.title}>
                {group.controls.map((c) => (
                  <ControlRow
                    key={c.key}
                    control={c}
                    value={values[c.key]!}
                    onChange={(v) => set(c.key, v)}
                  />
                ))}
              </Group>
            ))}
          </div>
        </aside>
      </div>
      <CodeTabs
        label="Code"
        tabs={[
          { id: 'playground', label: `${slug}.tsx`, code: spec.code(values) },
          { id: 'example', label: 'example.tsx', code: example },
        ]}
      />
    </div>
  );
}

const APPEARANCE = new Set(['accent', 'reducedMotion']);

/** Component-specific props first, then the shared appearance props in their own group. */
function groupControls(controls: Control[]): { title?: string; controls: Control[] }[] {
  const own = controls.filter((c) => !APPEARANCE.has(c.key));
  const appearance = controls.filter((c) => APPEARANCE.has(c.key));
  return [
    { controls: own },
    ...(appearance.length ? [{ title: 'Appearance', controls: appearance }] : []),
  ].filter((g) => g.controls.length > 0);
}

function ControlRow({
  control: c,
  value,
  onChange,
}: {
  control: Control;
  value: Values[string];
  onChange: (v: Values[string]) => void;
}) {
  switch (c.type) {
    case 'choice':
      return (
        <WideRow label={c.label}>
          <Choice label={c.label} options={c.options} value={String(value)} onChange={onChange} />
        </WideRow>
      );
    case 'range':
      return (
        <WideRow>
          <Slider
            label={c.label}
            value={Number(value)}
            min={c.min}
            max={c.max}
            step={c.step}
            format={c.format}
            onChange={onChange}
          />
        </WideRow>
      );
    case 'text':
      return (
        <Row label={c.label}>
          <TextField
            label={c.label}
            value={String(value)}
            onChange={onChange}
            placeholder={c.placeholder}
          />
        </Row>
      );
    case 'toggle':
      return (
        <Row label={c.label}>
          <Switch label={c.label} checked={!!value} onChange={onChange} />
        </Row>
      );
    case 'color':
      return (
        <Row label={c.label}>
          <Swatches label={c.label} value={String(value)} onChange={onChange} />
        </Row>
      );
    case 'action':
      return <ActionRow label={c.label} onPress={() => onChange(Number(value) + 1)} />;
  }
}
