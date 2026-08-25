"use client";

import { Scene } from "@/components/scene/Scene";
import { Caption, Chip, Fade, Label, SvgNode, Wire } from "@/components/scene/svg";
import { anchor, arc, line, type Box } from "@/components/scene/geometry";
import type { SceneStep } from "@/components/scene/types";

const W = 880;
const H = 380;

const agent: Box = { x: 170, y: 170, w: 138, h: 56 };
const server: Box = { x: 700, y: 170, w: 170, h: 60 };

const pollOut = [0, 1, 2, 3].map((i) =>
  arc(anchor(agent, "right", -20 + i * 2), anchor(server, "left", -20 + i * 2), 26),
);
const pollBack = [0, 1, 2, 3].map((i) =>
  arc(anchor(server, "left", 4 + i * 2), anchor(agent, "right", 4 + i * 2), 26),
);
const push = line(anchor(server, "left", 22), anchor(agent, "right", 22));

const steps: SceneStep[] = [
  {
    id: "poll1",
    label: "Poll",
    title: "Without events, waiting means asking.",
    body: (
      <>
        <code>tasks/get</code>… <code>working</code>. The answer is fine. The
        rhythm is the problem.
      </>
    ),
    hold: 2600,
  },
  {
    id: "poll2",
    label: "Poll again",
    title: "Are you done? No. Are you done? No.",
    body: "Every poll costs a round trip and a context switch, and the answer almost never changes. Poll slowly instead and you learn about completion late.",
    hold: 3000,
  },
  {
    id: "poll3",
    label: "And again",
    title: "Multiply by every task, every subscription, every agent.",
    body: "Polling is quadratic waste wearing a polite face. It also generalizes badly: resource subscriptions and external triggers have the same shape.",
    hold: 3000,
  },
  {
    id: "push",
    label: "Server-initiated",
    title: "The roadmap direction: the server speaks when something happens.",
    body: "Channels, subscriptions, webhooks — the mechanism is under design, but the direction is set: completion, progress and triggers arrive as events instead of being fished for.",
    hold: 3800,
  },
  {
    id: "react",
    label: "React",
    title: "The agent stops scheduling curiosity and starts reacting.",
    body: "An event arrives; the agent consumes the result and composes the next step. This closes the loop that Tasks opened.",
    hold: 3600,
  },
];

export function EventScene() {
  return (
    <Scene
      id="fig-events"
      fig="Fig. 10"
      title="Polling vs. being told"
      hint="Why Tasks pull events into the roadmap almost by necessity."
      accent="event"
      steps={steps}
      viewBox={`0 0 ${W} ${H}`}
    >
      {({ index, runKey }) => {
        const polls = index === 0 ? 1 : index === 1 ? 2 : index === 2 ? 4 : 0;
        const pushing = index >= 3;

        return (
          <>
            {/* Poll storm */}
            {Array.from({ length: polls }).map((_, i) => (
              <g key={`p-${i}-${runKey}`}>
                <Wire
                  d={pollOut[i]}
                  role="neutral"
                  state="on"
                  flow="once"
                  runKey={`${runKey}-o${i}`}
                  speed={620}
                />
                <Wire
                  d={pollBack[i]}
                  role="neutral"
                  state="on"
                  flow="once"
                  runKey={`${runKey}-b${i}`}
                  speed={620}
                  arrow
                />
              </g>
            ))}
            {polls > 0 ? (
              <>
                <Chip x={435} y={92} text="tasks/get?" role="neutral" />
                <Chip
                  x={435}
                  y={252}
                  text={index === 2 ? '"working" ×4' : '"working"'}
                  role="neutral"
                />
              </>
            ) : null}

            {/* Push */}
            <Fade show={pushing}>
              <Wire
                key={`push-${runKey}`}
                d={push}
                role="event"
                state="on"
                flow="once"
                dot
                runKey={runKey}
                speed={880}
              />
              <Chip
                x={435}
                y={132}
                text={index === 4 ? "event: task 7865-12 completed" : "event"}
                role="event"
                tone="solid"
              />
            </Fade>

            <SvgNode
              box={agent}
              role="agent"
              state="active"
              title="Agent"
              sub={pushing ? "reacts" : "keeps asking"}
            />
            <SvgNode
              box={server}
              role={pushing ? "event" : "server"}
              state={pushing ? "active" : "idle"}
              title="MCP server"
              sub={pushing ? "initiates" : "answers polls"}
            />

            {index === 2 ? (
              <Label x={435} y={302} emph>
                × every task × every subscription × every agent
              </Label>
            ) : null}

            {index === 4 ? (
              <Chip
                x={170}
                y={262}
                text="next: consume result → compose"
                role="agent"
              />
            ) : null}

            <Caption x={W / 2} y={H - 16}>
              {pushing
                ? "roadmap work: lifecycle, cancellation and errors must match the other primitives"
                : "every arrow here is a request that mostly learns nothing"}
            </Caption>
          </>
        );
      }}
    </Scene>
  );
}
