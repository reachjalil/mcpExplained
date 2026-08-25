# Contributing

Corrections and new explainers are both welcome. The bar for prose is
"would a careful engineer trust this": separate what is in merged spec text
from what is roadmap work from what is your own synthesis — the article
components give you `<Evidence level="spec | roadmap | inference" />` badges
for exactly this.

## Repo layout

```
app/                       Next.js app router pages (static export)
  articles/<slug>/         one folder per article
components/
  scene/                   the reusable player: step machine, shell, SVG parts
  scenes/                  per-article replayable diagrams
  widgets/                 self-contained interactives (state machines, races…)
  article/                 prose building blocks (sections, callouts, quotes)
  site/                    header, footer, theme toggle
styles/                    plain CSS, imported once via app/globals.css
lib/                       article registry, site constants
```

## Building a scene from scratch

A scene is: **an array of steps** plus **a render function that draws the
current step**. The player shell handles everything else.

```tsx
"use client";

import { Scene } from "@/components/scene/Scene";
import { SvgNode, Wire, Chip } from "@/components/scene/svg";
import { anchor, curveH, type Box } from "@/components/scene/geometry";
import type { SceneStep } from "@/components/scene/types";

const a: Box = { x: 150, y: 120, w: 120, h: 50 };   // boxes are centre-based
const b: Box = { x: 550, y: 120, w: 140, h: 50 };
const wire = curveH(anchor(a, "right"), anchor(b, "left"));

const steps: SceneStep[] = [
  { id: "call",  label: "Call",  title: "The agent calls the server.",
    body: "One sentence of narration.", hold: 2800 },
  { id: "reply", label: "Reply", title: "The server answers.",
    body: "Another sentence.", hold: 2800 },
];

export function MyScene() {
  return (
    <Scene id="fig-mine" fig="Fig. 1" title="My first scene"
           steps={steps} viewBox="0 0 700 240">
      {({ index, runKey }) => (
        <>
          <Wire d={wire} role="agent"
                state={index === 0 ? "on" : "off"}
                flow={index === 0 ? "once" : null}
                dot runKey={runKey} />
          <SvgNode box={a} role="agent"  state="active" title="Agent" />
          <SvgNode box={b} role="server"
                   state={index === 1 ? "active" : "idle"} title="Server" />
          {index === 1 ? <Chip x={350} y={60} text="result" role="server" /> : null}
        </>
      )}
    </Scene>
  );
}
```

Rules that keep scenes consistent:

- **Never add controls inside a scene.** The shell owns play/pause/pips.
- **Key one-shot animations with `runKey`** (comets, dots) so replaying a
  step restarts them.
- **Use roles, not colours.** `role="agent" | server | human | model | task |
  event | danger | neutral"` — the palette follows the theme.
- **Both themes, always.** Tokens handle it if you stick to the vocabulary;
  check dark mode before you open a PR.
- **Reduced motion is not optional.** The shell collapses transitions when
  `prefers-reduced-motion` is set — don't fight it with bespoke animation.
- **Narration is one or two sentences.** The diagram carries the rest.

## Adding an article

1. Register it in `lib/articles.ts`.
2. Create `app/articles/<slug>/page.tsx` — copy the structure of the
   existing article: hero, lede, `<Toc>`, numbered `<Section>`s, sources.
3. Scenes go in `components/scenes/`, bigger interactives in
   `components/widgets/`.
4. Tag claims with `<Evidence />`. End with a sources list.

## Before you open a PR

```bash
npm run check   # typecheck + lint + production build must all pass
```

Please include (in the PR description) which figures you added or changed
and a sentence on how you verified both themes and a narrow viewport.
