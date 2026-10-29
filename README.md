# Interlude

**Components for the in-between.** Open-source React components for the moments between a request and its result: loaders that wait honestly, some with a game hidden inside, and AI components that show what an agent actually did.

Typed props, no provider lock-in, installed one at a time with the [shadcn CLI](https://ui.shadcn.com). Every component is copied into your project as source, so you can read it, change it and delete what you don't need. There is no runtime, hosted service or telemetry.

## Install

Interlude is a [shadcn GitHub registry](https://ui.shadcn.com/docs/registry/github): the CLI reads `registry.json` from this repository.

```bash
pnpm dlx shadcn@latest add JanaSundar/interlude/agent-activity
```

Swap `agent-activity` for any item below. `npx shadcn@latest add …`, `yarn dlx` and `bunx --bun` work the same way. Pin a release with a ref, for example `JanaSundar/interlude/snake#v0.1.0`.

You need a project with a `components.json` (`shadcn init`) and [Motion](https://motion.dev) for React, which the CLI installs for you.

## Components

| Group    | Components                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Waiting  | Dot Matrix, Orbital, Pulse, Progress, Skeleton                                                                                  |
| Status   | Thinking Indicator                                                                                                              |
| Activity | Agent Activity, Tool Call                                                                                                       |
| Output   | Sources, Streaming Markdown, Generative Card                                                                                    |
| Actions  | Approval Gate, Response Actions                                                                                                 |
| Playable | Snake, Falling Blocks, Pong, Breakout, 2048, Memory Match, Whack-a-Mole, Space Shooter, Sliding Puzzle, Dino Run, Reaction Test |

The playable loaders look like quiet dot matrices until someone clicks one. The game is a guest: it stops the moment your task ends, input is disabled, and focus moves to the result. Score never feeds into task progress.

```tsx
import { SnakeLoader } from '@/components/interlude/snake/snake';

<SnakeLoader active={isGenerating} label="Generating your response" />;
```

### Principles

- **Truthful state.** Components render the status your app supplies. Nothing completes, succeeds or cites on its own.
- **Yours to edit.** Installed as source; every file lands in your project.
- **Accessible by default.** Keyboard paths, managed focus, polite announcements and real reduced-motion alternatives.
- **Motion with purpose.** Motion for React for state changes; high-frequency work stays out of React renders.

## Develop

This repository is both the registry and its documentation site (TanStack Start, Vite+, Tailwind CSS 4).

```bash
pnpm install
pnpm dev        # docs site with live playgrounds
pnpm check      # format, lint and type-check
pnpm test       # unit tests
pnpm build      # static build: prerendered pages, sitemap, robots.txt and the Open Graph cards
```

Other scripts:

```bash
pnpm registry   # regenerate registry.json from registry/catalog.ts
pnpm icons      # regenerate favicons and app icons
```

Open Graph cards are drawn by [Takumi](https://takumi.kane.tw) from the catalog, one per component plus the home page and docs, so they never go stale. In development they are served live at `/og/<name>.png` (for example `/og/snake.png`); the build writes them into `dist/client/og`. Nothing is checked in.

Set `VITE_SITE_URL` when building for a different domain; canonical URLs, Open Graph tags and the sitemap follow it.

### Layout

```
registry/
  catalog.ts                 one source of truth: names, docs, install targets
  components/interlude/
    primitives/              shared status, motion, icons, dot matrix
    core/                    game shell, input, canvas and the fixed-step loop
    <component>/             one folder per installable item
registry.json                generated; what the shadcn CLI reads
src/                         the docs site, playgrounds and routes
scripts/                     registry, icon and OG card generators
```

Every item depends on a shared layer (`interlude-primitives`, plus `interlude-core` for the games) through its full GitHub address, so a single `add` pulls in what it needs.

### Adding a game

1. Create `registry/components/interlude/<slug>/` with pure `logic.ts` (and tests), a `pattern.ts` for the loader's dot animation and the component, built with `createLoader`.
2. Add an entry to `registry/catalog.ts` and a line to the `games` map in `src/site/items.tsx`.
3. Run `pnpm registry`, then `pnpm check && pnpm test`.

## License

[MIT](LICENSE)
