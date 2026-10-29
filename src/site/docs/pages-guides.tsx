import { Link } from '@tanstack/react-router';
import { HoverText } from '../chrome';
import { CodeTabs } from '../code';
import { cssTokens } from '../props';
import { Callout, H2, H3, Prose, Terms } from './prose';

const eventShape = `type ActivityEvent = {
  id: string;            // updates to one step share an id
  title: string;
  status: 'pending' | 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled';
  kind?: 'search' | 'read' | 'tool' | 'approval' | 'process' | 'message' | 'complete';
  seq?: number;          // stream position: makes late and repeated deliveries safe
  target?: string;       // a path, query or tool name
  detail?: string;       // plain text, never HTML
  startedAt?: number | string;
  endedAt?: number | string;
};`;

const streamUsage = `// Your runtime, your events. Interlude only renders them.
const [events, setEvents] = useState<unknown[]>([]);

useEffect(() => {
  const source = new EventSource('/api/agent/stream');
  source.onmessage = (m) => setEvents((log) => [...log, JSON.parse(m.data)]);
  return () => source.close();
}, []);

<AgentActivity events={events} title="Working on your request" />`;

export function AgentEvents() {
  return (
    <Prose>
      <p>
        AI components take plain typed props and callbacks. They work with any model provider, SDK
        or agent runtime, because they only render what you hand them.
      </p>
      <H2>The event log</H2>
      <p>
        Agent Activity takes the raw log as it arrives. Append every event; updates to the same step
        share an <code>id</code>.
      </p>
      <CodeTabs label="Types" tabs={[{ id: 'shape', label: 'events.ts', code: eventShape }]} />
      <H2>Streaming events</H2>
      <CodeTabs
        label="Example"
        tabs={[{ id: 'stream', label: 'activity.tsx', code: streamUsage }]}
      />
      <H3>Duplicates and ordering</H3>
      <p>
        With <code>seq</code>, a late or repeated delivery can’t move a step backwards, and rows
        appear in stream order even when events arrive out of order.
      </p>
      <H3>Malformed events</H3>
      <p>
        Events without an id or title are dropped, and unknown statuses read as pending. Nothing is
        guessed or invented.
      </p>
      <H2>Announcements</H2>
      <p>
        Only step starts and endings reach screen readers, never every update. Streaming text
        announces once, when it completes or stops.
      </p>
      <p>
        See the{' '}
        <Link to="/docs/components" search={{ group: 'Activity' }} className="text-accent">
          <HoverText active>activity components</HoverText>
        </Link>
        .
      </p>
    </Prose>
  );
}

const tokens = `:root {
  --interlude-accent: oklch(0.64 0.19 45);
  --interlude-panel: white;
}
.dark {
  --interlude-accent: oklch(0.75 0.16 55);
  --interlude-panel: oklch(0.17 0.005 260);
}`;

export function Theming() {
  return (
    <Prose>
      <p>
        Components read colour through CSS variables with sensible fallbacks, so they look right
        with no theme at all.
      </p>
      <H2>Tokens</H2>
      <Terms rows={cssTokens} />
      <H2>Light and dark</H2>
      <p>Set the tokens once per theme. Everything else follows.</p>
      <CodeTabs
        label="Example"
        tabs={[{ id: 'css', label: 'globals.css', code: tokens, lang: 'css' }]}
      />
      <H2>Per-instance overrides</H2>
      <p>
        Every component takes an <code>accent</code> prop and a <code>className</code>. Text and
        borders follow <code>currentColor</code>, so components sit inside your typography instead
        of fighting it.
      </p>
    </Prose>
  );
}

export function Accessibility() {
  return (
    <Prose>
      <p>Accessibility is part of each component, not a layer added later.</p>
      <H2>Status in words</H2>
      <p>
        Every status has a shape and words, never colour alone: a ring, a spinning arc, a pause, a
        check, a cross, a dash.
      </p>
      <H2>Announcements</H2>
      <p>
        Live regions announce meaningful changes only: a step finishing, a stream ending, a decision
        recorded. Never tokens or animation frames.
      </p>
      <H2>Keyboard</H2>
      <ul>
        <li>
          Disclosures are real buttons with <code>aria-expanded</code> and{' '}
          <code>aria-controls</code>.
        </li>
        <li>Toolbars move with the arrow keys, Home and End.</li>
        <li>
          Games: Enter opens, Escape closes and returns focus, P pauses, and real-time games pause
          when focus leaves.
        </li>
      </ul>
      <H2>Reduced motion</H2>
      <p>
        <code>reducedMotion</code> follows the OS setting by default. Under reduced motion every
        component shows a still frame: no travel, no transforms and no slow looping fades.
      </p>
      <H3>How motion runs</H3>
      <p>
        Loops run off one shared clock as motion values, and games use a fixed-step loop, so
        high-frequency animation never re-renders React.
      </p>
    </Prose>
  );
}

export function Security() {
  return (
    <Prose>
      <p>Model output and tool results are untrusted. Components treat them that way.</p>
      <H2>Rendering output</H2>
      <ul>
        <li>
          Model text is rendered as text. Markdown is parsed into a typed tree; raw HTML is never
          interpreted.
        </li>
        <li>Generative cards use a fixed block contract and never execute model-provided code.</li>
      </ul>
      <H2>Links and secrets</H2>
      <ul>
        <li>
          Only http(s) and mailto URLs become links, and external links never get your page’s
          opener.
        </li>
        <li>
          Tool arguments and results mask keys such as <code>apiKey</code>, <code>token</code> and{' '}
          <code>password</code>.
        </li>
      </ul>
      <H2>Approvals</H2>
      <Callout tone="warn">
        A visual approval gate is not authorisation. Record and enforce every decision in your
        server or agent runtime; the gate only shows an outcome after you confirm it.
      </Callout>
    </Prose>
  );
}
