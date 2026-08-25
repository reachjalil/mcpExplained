"use client";

import { Scene } from "@/components/scene/Scene";
import { Caption, Chip, Fade, Label, SvgNode, Wire } from "@/components/scene/svg";
import { anchor, line, type Box } from "@/components/scene/geometry";
import type { SceneStep } from "@/components/scene/types";

const W = 880;
const H = 420;

const human: Box = { x: 296, y: 60, w: 150, h: 46 };
const agent: Box = { x: 296, y: 210, w: 158, h: 58 };
const model: Box = { x: 296, y: 360, w: 150, h: 46 };
const server: Box = { x: 706, y: 210, w: 172, h: 62 };

const out = line(anchor(agent, "right", -14), anchor(server, "left", -14));
const back = line(anchor(server, "left", 14), anchor(agent, "right", 14));
const askHuman = line(anchor(agent, "top", -18), anchor(human, "bottom", -18));
const humanSays = line(anchor(human, "bottom", 18), anchor(agent, "top", 18));
const askModel = line(anchor(agent, "bottom", -18), anchor(model, "top", -18));

const steps: SceneStep[] = [
  {
    id: "call",
    label: "tools/call",
    title: "The agent calls a tool that cannot finish in one shot.",
    body: (
      <>
        <code>book_flight</code> looks like an ordinary call. The server is
        about to discover that it needs something the request did not contain.
      </>
    ),
    hold: 2800,
  },
  {
    id: "required",
    label: "input_required",
    title: "The server answers “not yet” instead of blocking or guessing.",
    body: (
      <>
        It returns <code>input_required</code>, the questions it needs answered,
        and an opaque <code>requestState</code> blob — everything needed to
        resume, handed back to the caller rather than kept in memory.
      </>
    ),
    hold: 4200,
  },
  {
    id: "route",
    label: "Who answers?",
    title: "Here is the part that makes this agentic.",
    body: "The server said what it needs. It did not say who should supply it. That routing decision — ask the person, ask the model, read it from policy — belongs to the agent.",
    hold: 4200,
  },
  {
    id: "human",
    label: "Elicitation",
    title: "This one is a money question, so the agent asks the human.",
    body: "A price confirmation is exactly the kind of decision that should not be improvised by a model. The same mechanism would have allowed sampling instead.",
    hold: 3600,
  },
  {
    id: "resume",
    label: "Resume",
    title: "The agent replays the request with the answers attached.",
    body: (
      <>
        <code>inputResponses</code> plus the original <code>requestState</code>.
        Any process of that server can pick this up — the one that asked the
        question may be long gone.
      </>
    ),
    hold: 4000,
  },
  {
    id: "result",
    label: "Result",
    title: "The call completes, having spanned a human decision.",
    body: "From the tool's point of view this was one operation. From the transport's point of view it was two independent, self-contained requests.",
    hold: 3600,
  },
];

export function RoundTripScene() {
  return (
    <Scene
      id="fig-mrtr"
      fig="Fig. 5"
      title="A tool call that stops to ask a question"
      hint="Multi round-trip requests: pausing without a session to pause in."
      accent="model"
      steps={steps}
      viewBox={`0 0 ${W} ${H}`}
    >
      {({ index, runKey }) => {
        const showRoute = index === 2;
        const humanAnswering = index === 3;

        return (
          <>
            <Wire
              key={`out-${runKey}`}
              d={out}
              role="agent"
              state={index === 0 || index === 4 ? "on" : "off"}
              flow={index === 0 || index === 4 ? "once" : null}
              dot
              runKey={runKey}
              speed={820}
            />
            <Wire
              key={`back-${runKey}`}
              d={back}
              role={index === 1 ? "human" : "server"}
              state={index === 1 || index === 5 ? "on" : "off"}
              flow={index === 1 || index === 5 ? "once" : null}
              dot
              runKey={runKey}
              speed={820}
            />

            <Wire
              key={`ah-${runKey}`}
              d={askHuman}
              role="human"
              state={showRoute || humanAnswering ? "on" : "off"}
              flow={showRoute || humanAnswering ? "once" : null}
              runKey={runKey}
              speed={700}
            />
            <Wire
              key={`hs-${runKey}`}
              d={humanSays}
              role="human"
              state={humanAnswering ? "on" : "off"}
              flow={humanAnswering ? "once" : null}
              runKey={`${runKey}-h`}
              speed={700}
            />
            <Wire
              key={`am-${runKey}`}
              d={askModel}
              role="model"
              state={showRoute ? "on" : "off"}
              flow={showRoute ? "once" : null}
              dashed={!showRoute}
              runKey={runKey}
              speed={700}
            />

            <SvgNode
              box={human}
              role="human"
              state={showRoute || humanAnswering ? "active" : "dim"}
              title="Human"
              sub="elicitation"
            />
            <SvgNode
              box={model}
              role="model"
              state={showRoute ? "active" : "dim"}
              title="Model"
              sub="sampling"
            />
            <SvgNode
              box={agent}
              role="agent"
              state="active"
              title="Agent / Host"
              sub={showRoute ? "decides who is asked" : "mediator"}
            />
            <SvgNode
              box={server}
              role="server"
              state={index === 0 || index === 4 || index === 5 ? "active" : "idle"}
              title="Flight MCP server"
              sub={index >= 1 ? "any process, no session" : "stateless"}
            />

            {/* Message labels */}
            {index === 0 ? (
              <Chip x={500} y={172} text="tools/call book_flight" role="agent" tone="solid" />
            ) : null}
            {index === 1 ? (
              <>
                <Chip x={500} y={248} text='resultType: "input_required"' role="human" tone="solid" />
                <Chip x={500} y={286} text="inputRequests: [ fare ]" role="human" />
                <Chip x={500} y={318} text='requestState: "opaque…"' role="neutral" />
              </>
            ) : null}
            {showRoute ? (
              <>
                <Chip x={296} y={134} text="ask the person?" role="human" />
                <Chip x={296} y={288} text="ask the model?" role="model" />
                <Caption x={W / 2} y={400}>
                  the server declares the requirement — the agent decides how it
                  gets satisfied
                </Caption>
              </>
            ) : null}
            {humanAnswering ? (
              <Chip x={296} y={134} text="Economy Flex · $1,240" role="human" tone="solid" />
            ) : null}
            {index === 4 ? (
              <>
                <Chip x={500} y={166} text="inputResponses + requestState" role="agent" tone="solid" />
                <Label x={706} y={286} emph>
                  a different process may serve this one
                </Label>
              </>
            ) : null}
            {index === 5 ? (
              <Chip x={500} y={248} text="result: booking LX39 confirmed" role="server" tone="solid" />
            ) : null}

            <Fade show={index >= 1 && index <= 4}>
              <Label x={706} y={172}>
                keeps nothing between the two requests
              </Label>
            </Fade>
          </>
        );
      }}
    </Scene>
  );
}
