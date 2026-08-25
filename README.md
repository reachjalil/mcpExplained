<p align="center">
  <img src=".github/media/banner.svg" alt="mcpExplained — interactive, replayable explainers for the Model Context Protocol" width="720" />
</p>

# mcpExplained

**Interactive, replayable explainers for the Model Context Protocol.**

Protocols are easier to understand when you can press play. Every idea that
involves something moving — a call, a handle, a task, an event — gets a
diagram you can step through, pause, scrub, and replay. No animation
libraries: hand-written SVG driven by a tiny step machine, with full
keyboard control and reduced-motion support.

**Live site:** https://reachjalil.github.io/mcpExplained/

## Articles

| # | Article | Status |
|---|---------|--------|
| 01 | [Agent-Mediated Composition](https://reachjalil.github.io/mcpExplained/articles/agent-mediated-composition/) — how sessionless MCP, multi round-trip requests, Tasks, and events turn MCP into composable workflow primitives, with the agent as the composer. 16 interactive figures, including a live composition playground. | Live |
| 02 | Progressive Discovery | Planned |
| 03 | MCP Apps, Explained | Planned |

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # typecheck + lint + production build
```

Requires Node 20.9+. The site is fully static (`output: "export"`), so
`npm run build` produces a deployable `out/` directory.

## How the figures work

Three layers, all in this repo:

1. **The step machine** — [`components/scene/useScene.ts`](components/scene/useScene.ts).
   A scene is an array of steps (`id`, narration, hold time). The hook owns
   play/pause/scrub state, keyboard bindings (`space`, `←`, `→`, `r`),
   pauses off-screen via IntersectionObserver, autoplays on first reveal,
   and exposes a `runKey` that changes on every transition so one-shot CSS
   animations restart on replay.

2. **The player shell** — [`components/scene/Scene.tsx`](components/scene/Scene.tsx).
   Every diagram shares the same chrome: figure number, stage, per-step
   narration, transport controls, step pips. Scenes never own their own
   buttons; they only draw the current step.

3. **The SVG vocabulary** — [`components/scene/svg.tsx`](components/scene/svg.tsx)
   plus [`geometry.ts`](components/scene/geometry.ts). Nodes, wires with
   travelling comets (`pathLength="100"` so the dash maths never measures
   real geometry), chips, zones, fades. Colour is semantic and constant
   across the whole site: the agent is violet, servers are teal, humans
   amber, tasks green, events pink.

Beyond scenes there are self-contained interactive widgets (state machines
you can drive, payload inspectors, races, a composition playground) in
[`components/widgets/`](components/widgets/).

Want to build one? Read [CONTRIBUTING.md](CONTRIBUTING.md) — it walks
through a scene from scratch.

## Design principles

- **Replayable, not looping.** Readers control time. Every figure can be
  scrubbed backwards.
- **Colour means something.** One palette, learned once, reused everywhere.
- **Claims are tagged.** `spec today` / `roadmap` / `inference` badges keep
  what is shipped separate from what is speculation.
- **No animation dependency.** CSS transitions + a step machine cover
  everything; `prefers-reduced-motion` collapses to instant transitions.

## License

[MIT](LICENSE). The prose of the articles is © their authors, also under
MIT — reuse with attribution.
