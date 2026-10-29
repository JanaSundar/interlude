import { CodeTabs } from '../code';
import type { Item } from '../items';
import { exampleValues, Playground } from '../playground/playground';
import { ComponentPreview } from './component-preview';
import { InstallSection } from './install-section';
import { DocsLayout } from './layout';
import { componentKey } from './order';
import { H2, H3, Prose } from './prose';
import { PropsTable } from './props-table';

/**
 * A component's docs page, following the shadcn flow: a live preview with
 * its code, installation, usage, examples, then the API reference. Every
 * heading feeds the "On this page" outline.
 */
export function ComponentDocPage({ item }: { item: Item }) {
  const spec = item.playground;
  const examples = spec.examples ?? [];
  return (
    <DocsLayout
      current={componentKey(item.slug)}
      eyebrow={`Components · ${item.group}`}
      title={item.name}
      description={item.description}
    >
      <div>
        <Prose>
          {item.game && (
            <>
              <H2>How it plays</H2>
              <p>{item.game}</p>
              {item.controls && (
                <p>
                  Controls: <code>{item.controls}</code>. Escape closes the game.
                </p>
              )}
            </>
          )}

          <div className="text-sm leading-normal text-fg">
            <Playground spec={spec} example={item.usage} slug={item.slug} />
          </div>

          <H2>Installation</H2>
          <InstallSection item={item} />

          <H2>Usage</H2>
          <CodeTabs label="Usage" tabs={[{ id: 'usage', label: 'usage.tsx', code: item.usage }]} />

          {examples.length > 0 && (
            <>
              <H2>Examples</H2>
              {examples.map((example) => (
                <div key={example.title} className="flex flex-col gap-3">
                  <H3>{example.title}</H3>
                  {example.description && <p>{example.description}</p>}
                  <ComponentPreview item={item} values={exampleValues(spec, example)} />
                </div>
              ))}
            </>
          )}

          <H2 toc="API reference">API Reference</H2>
          <PropsTable props={item.props} />

          <H2>Accessibility</H2>
          <ul>
            {item.a11y.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <H2>Motion</H2>
          <p>{item.motion}</p>
        </Prose>
      </div>
    </DocsLayout>
  );
}
