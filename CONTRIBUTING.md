# Contributing

Corrections and new essays are both welcome. The voice of the site is
first-person, warm, and short — the machines carry the weight, the prose
frames them. One concept per essay.

## Repo layout

```
app/                     Next.js app router pages (static export)
  articles/<slug>/       one folder per essay
components/
  machine/               the kit: stage (dots), Machine (card), Goals, buttons
  toys/                  one file per interactive machine
  ui/                    InView (scroll class), Glyph (inline shapes)
  site/                  header, footer
styles/                  base.css, site.css, machine.css — plain CSS
lib/                     essay registry, site constants
```

## Building a machine

A machine is: **a stage of actors** plus **an async click handler** that
choreographs dots with `fly` / `deny` / `pulse` / `chip`, and **goals** that
tick when the reader has actually done the thing.

```tsx
"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { Goals, type GoalState } from "@/components/machine/Goals";
import { ShapeButton } from "@/components/machine/buttons";

export function MyToy() {
  const { stageRef, actor, fly, pulse } = useStage();
  const [goals, setGoals] = useState<GoalState>({});

  const go = async () => {
    await fly({ from: "you", to: "server" });
    pulse("server");
    await fly({ from: "server", to: "you", kind: "res" });
    setGoals((s) => ({ ...s, sent: (s.sent ?? 0) + 1 }));
  };

  return (
    <>
      <Goals state={goals} items={[{ id: "sent", label: "Send a request." }]} />
      <Machine stageRef={stageRef} label="A request and its answer">
        <ShapeButton refCb={actor("you")} onClick={go} hint label="Send" />
        <Actor refCb={actor("server")} kind="server" name="server" />
      </Machine>
    </>
  );
}
```

House rules:

- **Real controls only.** Buttons the reader clicks, toggles the reader
  flips. No autoplay, no timeline scrubbers.
- **Goals are earned.** A goal completes when the reader's interaction
  finishes, not when the section scrolls by.
- **The palette is fixed.** Amber = request, teal = result, black = actor,
  red = a boundary saying no. Inline prose glyphs (`<G k="request">`)
  must match the machine.
- **Respect reduced motion.** `useStage` already collapses durations;
  don't add bespoke animation outside the kit without the same guard.
- **Keep prose short.** Two to four short paragraphs around each machine.

## Adding an essay

1. Register it in `lib/articles.ts`.
2. Create `app/articles/<slug>/page.tsx` — copy the structure of essay 01:
   header, numbered `<H2>` sections, machines, fine print, reading list.
3. Toys go in `components/toys/`, one file each.

## Before you open a PR

```bash
npm run check   # typecheck + lint + production build must pass
```

Say in the PR which machines you added and how you verified them (clicks,
narrow viewport, reduced motion).
