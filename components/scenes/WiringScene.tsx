"use client";

import { Scene } from "@/components/scene/Scene";
import { Caption, Chip, Fade, Label, SvgNode, Wire } from "@/components/scene/svg";
import { line, type Box } from "@/components/scene/geometry";
import type { SceneStep } from "@/components/scene/types";

const W = 880;
const H = 420;
const CX = W / 2;
const CY = 190;
const RX = 242;
const RY = 124;

const PROVIDERS = [
  { id: "flights", title: "Flights", sub: "search · book" },
  { id: "hotels", title: "Hotels", sub: "search · reserve" },
  { id: "calendar", title: "Calendar", sub: "events" },
  { id: "payments", title: "Payments", sub: "charge" },
  { id: "crm", title: "CRM", sub: "customers" },
  { id: "expenses", title: "Expenses", sub: "reports" },
];

/** Six providers evenly spaced on a circle, first one at the top. */
const boxes: Box[] = PROVIDERS.map((_, i) => {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / PROVIDERS.length;
  return {
    x: CX + Math.cos(angle) * RX,
    y: CY + Math.sin(angle) * RY,
    w: 104,
    h: 42,
  };
});

const agent: Box = { x: CX, y: CY, w: 128, h: 52 };

/** Every unordered pair of provider indices below `n`. */
function pairs(n: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) out.push([i, j]);
  }
  return out;
}

const steps: SceneStep[] = [
  {
    id: "cold",
    label: "Five capabilities",
    title: "Five useful capabilities. None of them knows the others exist.",
    body: "A flight service, a hotel service, a calendar, a payment processor, a CRM. Independent products, independent teams, independent release cycles.",
    hold: 2600,
  },
  {
    id: "mesh",
    label: "Hard-wired mesh",
    title: "Wire them together directly and you own every edge.",
    body: "Ten integrations for five services. Each one is code somebody writes, tests, versions and gets paged about at 3am.",
    hold: 3400,
  },
  {
    id: "sixth",
    label: "Add one more",
    title: "Add a sixth service and you add five more integrations.",
    body: "The edge count grows quadratically. This is the reason most useful cross-product workflows never get built: nobody wants to own the wire.",
    hold: 3600,
  },
  {
    id: "clear",
    label: "Enter the agent",
    title: "Now put an agent in the middle.",
    body: "The agent is the only participant that knows what the user actually wants. That turns out to be the piece of knowledge the wires were trying to encode.",
    hold: 2800,
  },
  {
    id: "star",
    label: "One contract each",
    title: "Six connections, not fifteen — and each provider implements only itself.",
    body: "Every server exposes its own capabilities over the same protocol. None of them takes a dependency on any other. The topology stops growing quadratically.",
    hold: 3600,
  },
  {
    id: "compose",
    label: "Compose at runtime",
    title: "The workflow now lives in the agent, assembled at runtime.",
    body: "Flights, then payments, then calendar — a path chosen for this request. Tomorrow's request can take a different path through the same unchanged servers.",
    hold: 4200,
  },
];

export function WiringScene() {
  return (
    <Scene
      id="fig-topology"
      fig="Fig. 1"
      title="Two ways to connect five capabilities"
      hint="Where the workflow knowledge lives — in the wires, or in the agent."
      steps={steps}
      viewBox={`0 0 ${W} ${H}`}
    >
      {({ index, runKey }) => {
        const meshVisible = index === 1 || index === 2;
        const providerCount = index >= 2 ? 6 : 5;
        const meshPairs = pairs(providerCount);
        const starVisible = index >= 4;
        const composing = index === 5;
        const composePath = [0, 3, 2];

        const metric =
          index === 0
            ? { n: "0", label: "integrations to own" }
            : index === 1
              ? { n: "10", label: "integrations to own" }
              : index === 2
                ? { n: "15", label: "integrations to own" }
                : index === 3
                  ? { n: "—", label: "wires deleted" }
                  : index === 4
                    ? { n: "6", label: "connections, one per capability" }
                    : { n: "1", label: "workflow, composed at runtime" };

        return (
          <>
            {/* Hard-wired mesh */}
            <Fade show={meshVisible}>
              {meshPairs.map(([i, j], k) => (
                <Wire
                  key={`${runKey}-${i}-${j}`}
                  d={line(boxes[i], boxes[j])}
                  role="neutral"
                  state="idle"
                  arrow={false}
                  dashed
                  draw={k * 55}
                />
              ))}
            </Fade>

            {/* Star topology */}
            <Fade show={starVisible}>
              {boxes.slice(0, 6).map((b, i) => (
                <Wire
                  key={`${runKey}-spoke-${i}`}
                  d={line(agent, b)}
                  role="server"
                  state="idle"
                  arrow={false}
                  draw={i * 70}
                />
              ))}
            </Fade>

            {/* The composed run */}
            {composing
              ? composePath.map((i, k) => (
                  <Wire
                    key={`${runKey}-run-${i}`}
                    d={line(agent, boxes[i])}
                    role="agent"
                    state="on"
                    arrow={false}
                    flow="once"
                    dot
                    speed={850}
                    runKey={`${runKey}-${k}`}
                  />
                ))
              : null}

            {/* Providers */}
            {PROVIDERS.map((p, i) => (
              <Fade key={p.id} show={i < providerCount}>
                <SvgNode
                  box={boxes[i]}
                  role="server"
                  state={
                    composing
                      ? composePath.includes(i)
                        ? "active"
                        : "dim"
                      : "idle"
                  }
                  title={p.title}
                  sub={p.sub}
                />
              </Fade>
            ))}

            {/* The agent */}
            <Fade show={index >= 3}>
              <SvgNode
                box={agent}
                role="agent"
                state={index >= 3 ? "active" : "idle"}
                title="Agent"
                sub="host"
              />
            </Fade>

            {/* Running commentary */}
            <g>
              <text
                x={28}
                y={44}
                className="sv-node-title"
                style={{ fontSize: 30, fontWeight: 700 }}
                dominantBaseline="middle"
              >
                {metric.n}
              </text>
              <Label x={28} y={66} anchor="start" emph>
                {metric.label}
              </Label>
            </g>

            {index === 2 ? (
              <Chip
                x={W - 96}
                y={44}
                text="n(n−1)/2"
                role="danger"
                tone="outline"
              />
            ) : null}

            {composing ? (
              <>
                <Chip
                  x={CX}
                  y={H - 46}
                  text="flights → payments → calendar"
                  role="agent"
                  tone="solid"
                />
                <Caption x={CX} y={H - 20}>
                  no server learned anything about any other server
                </Caption>
              </>
            ) : null}
          </>
        );
      }}
    </Scene>
  );
}
