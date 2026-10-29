import { Link } from '@tanstack/react-router';
import { CORE_ITEM, groups, PRIMITIVES_ITEM } from '@registry/catalog';
import { HoverText } from '../chrome';
import { CodeTabs, InstallTabs } from '../code';
import { items } from '../items';
import { REPO, REPO_URL } from '../meta';
import { Callout, H2, H3, Prose, Terms } from './prose';

export function Introduction() {
  return (
    <Prose>
      <p>
        Interlude is a registry of React components for the moments between a request and its
        result: honest loaders, ten that unfold into games, and AI components that show what an
        agent actually did. You copy each one into your project as source; there is no runtime,
        hosted service or telemetry.
      </p>
      <H2>What’s inside</H2>
      <p>
        {items.length} components, grouped by what they do. Each installs on its own and brings only
        the shared layer it needs.
      </p>
      <Terms
        rows={groups.map((g) => [
          g.id.toLowerCase(),
          `${g.blurb} (${items.filter((i) => i.group === g.id).length})`,
        ])}
      />
      <H2>Principles</H2>
      <H3>Truthful state</H3>
      <p>
        Your app owns every real operation. Components render the status you pass and never decide
        on their own that something finished, succeeded, was approved or came from a source.
      </p>
      <H3>Yours to edit</H3>
      <p>
        The shadcn CLI writes the files into your project. Read them, change them, delete what you
        don’t need.
      </p>
      <H3>Accessible and calm</H3>
      <p>
        Keyboard paths, managed focus and polite announcements are built in. Under reduced motion
        every component shows a still frame instead of looping.
      </p>
      <H2>Where to next</H2>
      <p>
        Start with{' '}
        <Link to="/docs/$page" params={{ page: 'installation' }} className="text-accent">
          <HoverText active>Installation</HoverText>
        </Link>
        , or browse the{' '}
        <Link to="/docs/components" className="text-accent">
          <HoverText active>components</HoverText>
        </Link>{' '}
        and open any playground.
      </p>
    </Prose>
  );
}

const tree = `components/
  interlude/
    primitives/        # shared by every item
    core/              # playable loaders only
    thinking-indicator/
      thinking-indicator.tsx
      patterns.ts`;

export function Installation() {
  return (
    <Prose>
      <p>
        Components install with the shadcn CLI straight from the{' '}
        <a href={REPO_URL} className="text-accent">
          <HoverText active>GitHub registry</HoverText>
        </a>
        . No build step or hosted JSON is involved: the CLI reads <code>registry.json</code> from
        the repository.
      </p>
      <H2>Requirements</H2>
      <ul>
        <li>
          React 19 and Tailwind CSS v4, scanning <code>components/interlude</code>.
        </li>
        <li>
          <code>motion</code>, which the CLI installs for you.
        </li>
        <li>
          A <code>components.json</code> from <code>shadcn init</code>, so the CLI knows your
          aliases.
        </li>
      </ul>
      <H2>Add a component</H2>
      <p>
        Every item is addressed as <code>{REPO}/&lt;item&gt;</code>.
      </p>
      <InstallTabs item="thinking-indicator" />
      <H3>Pin a version</H3>
      <p>
        Append <code>#ref</code> (a tag or commit) for reproducible installs, for example{' '}
        <code>{REPO}/thinking-indicator#v0.1.0</code>. Dependencies are pinned separately.
      </p>
      <H2>What gets installed</H2>
      <p>
        The item’s own folder plus its shared layer: <code>{PRIMITIVES_ITEM}</code> for everything,
        and <code>{CORE_ITEM}</code> as well for the playable loaders.
      </p>
      <CodeTabs label="Files" tabs={[{ id: 'tree', label: 'project', code: tree, lang: 'text' }]} />
      <Callout>
        Files land in your project, so updates are a re-run of <code>add</code> and a diff you
        review, never a silent package upgrade.
      </Callout>
    </Prose>
  );
}

const statusUsage = `import { useState } from 'react';
import { SnakeLoader } from '@/components/interlude/snake/snake';
import type { TaskStatus } from '@/components/interlude/primitives/status';

export function Answer() {
  const [status, setStatus] = useState<TaskStatus>('idle');

  async function ask() {
    setStatus('loading');
    try {
      await doTheRealWork(); // any SDK, fetch or worker
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return <SnakeLoader status={status} label="Generating your response" />;
}`;

const booleanUsage = `<ProgressLoader active={isUploading} value={sent} max={total} />`;

export function TaskLifecycle() {
  return (
    <Prose>
      <p>
        Every loader renders a task your app owns. It never decides on its own that the task is
        done.
      </p>
      <H2>Statuses</H2>
      <Terms
        rows={[
          ['idle', 'Nothing is running. The loader renders nothing.'],
          ['loading', 'The indicator runs and the label is announced.'],
          ['success', 'The indicator is replaced by the result at once.'],
          ['error', 'Same, with a distinct shape and words, never colour alone.'],
          ['cancelled', 'Same; the task was stopped.'],
        ]}
      />
      <H2>Driving a loader</H2>
      <CodeTabs label="Example" tabs={[{ id: 'answer', label: 'answer.tsx', code: statusUsage }]} />
      <H3>Boolean shorthand</H3>
      <p>
        If all you have is a boolean, pass <code>active</code>: true is loading, false is idle.
      </p>
      <CodeTabs label="Example" tabs={[{ id: 'bool', label: 'upload.tsx', code: booleanUsage }]} />
      <H3>Custom results</H3>
      <p>
        <code>result</code> takes a node or a function of the final status, rendered the moment the
        task ends.
      </p>
      <H2>Playable loaders</H2>
      <p>
        The ten game loaders look like quiet dot matrices until clicked. The game is a guest: when
        your task ends it stops immediately, input is disabled and focus moves to the result. Score
        never feeds into task progress.
      </p>
      <Callout>
        Progress is shown only when you pass a real number. Without one, the bar is honestly
        indeterminate.
      </Callout>
    </Prose>
  );
}
