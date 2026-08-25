"use client";

import { Scene } from "@/components/scene/Scene";
import { Caption, Chip, Fade, Label, SvgNode, Wire } from "@/components/scene/svg";
import { anchor, curveV, line, type Box } from "@/components/scene/geometry";
import type { SceneStep } from "@/components/scene/types";

const W = 880;
const H = 470;

/* Left: the flat old model. */
const oldAgent: Box = { x: 170, y: 120, w: 120, h: 48 };
const oldTool: Box = { x: 170, y: 240, w: 120, h: 44 };
const oldResult: Box = { x: 170, y: 352, w: 120, h: 44 };

/* Right: the new loop. */
const nAgent: Box = { x: 600, y: 110, w: 150, h: 56 };
const nTool: Box = { x: 600, y: 245, w: 130, h: 48 };
const nHuman: Box = { x: 430, y: 40, w: 104, h: 38 };
const nApp: Box = { x: 600, y: 34, w: 104, h: 38 };
const nModel: Box = { x: 770, y: 40, w: 104, h: 38 };
const nTask: Box = { x: 462, y: 360, w: 112, h: 44 };
const nDone: Box = { x: 600, y: 360, w: 100, h: 44 };
const nInput: Box = { x: 745, y: 360, w: 130, h: 44 };

const steps: SceneStep[] = [
  {
    id: "old",
    label: "First model",
    title: "The first mental model: agent, tool, result.",
    body: "Function calling with a registry. True, useful — and flat. Every call finishes before anything else matters, and the agent's job ends at picking the function.",
    hold: 3400,
  },
  {
    id: "branch",
    label: "Calls branch",
    title: "The new model: a call is the start of a small story.",
    body: (
      <>
        A call may complete, become a <code>task</code>, or pause on{" "}
        <code>input_required</code>. Three outcomes, three different next moves
        for the agent.
      </>
    ),
    hold: 3800,
  },
  {
    id: "voices",
    label: "Three voices",
    title: "Inputs can come from a person, an app, or the model.",
    body: "The host mediates all three. Who answers which question is a composition decision, made per question — not baked into any server.",
    hold: 3800,
  },
  {
    id: "loop",
    label: "The loop",
    title: "Events close the loop, and the next capability begins.",
    body: "Result or event → agent decides → another capability. The unit of thinking stops being the call and becomes the composition.",
    hold: 4000,
  },
];

export function MentalModelScene() {
  return (
    <Scene
      id="fig-mental"
      fig="Fig. 15"
      title="From tool invocation to composed workflow"
      hint="The before-and-after of how to think about an MCP interaction."
      steps={steps}
      viewBox={`0 0 ${W} ${H}`}
    >
      {({ index, runKey }) => {
        const showNew = index >= 1;
        const showVoices = index >= 2;
        const looping = index === 3;

        return (
          <>
            {/* ---- Old model, always visible, dimmed once the new appears */}
            <g
              style={{
                opacity: showNew ? 0.38 : 1,
                transition: "opacity 500ms var(--ease)",
              }}
            >
              <Wire d={line(anchor(oldAgent, "bottom"), anchor(oldTool, "top"))} role="neutral" state={index === 0 ? "on" : "idle"} flow={index === 0 ? "once" : null} runKey={runKey} />
              <Wire d={line(anchor(oldTool, "bottom"), anchor(oldResult, "top"))} role="neutral" state={index === 0 ? "on" : "idle"} flow={index === 0 ? "once" : null} runKey={`${runKey}-2`} />
              <SvgNode box={oldAgent} role="agent" state={index === 0 ? "active" : "idle"} title="Agent" />
              <SvgNode box={oldTool} role="server" state="idle" title="Tool" />
              <SvgNode box={oldResult} role="neutral" state="idle" title="Result" />
              <Label x={170} y={430} emph>
                the 2024 mental model
              </Label>
            </g>

            {/* ---- New model */}
            <Fade show={showNew}>
              <Wire
                d={line(anchor(nAgent, "bottom"), anchor(nTool, "top"))}
                role="agent"
                state="on"
                flow={showNew && !looping ? "once" : null}
                runKey={runKey}
              />
              {/* three outcomes */}
              <Wire d={curveV(anchor(nTool, "bottom", -34), anchor(nTask, "top"))} role="task" state={showNew ? "on" : "off"} runKey={runKey} />
              <Wire d={line(anchor(nTool, "bottom"), anchor(nDone, "top"))} role="server" state={showNew ? "on" : "off"} runKey={runKey} />
              <Wire d={curveV(anchor(nTool, "bottom", 34), anchor(nInput, "top"))} role="human" state={showNew ? "on" : "off"} runKey={runKey} />

              <SvgNode box={nAgent} role="agent" state="active" title="Agent / Host" sub="decides next" />
              <SvgNode box={nTool} role="server" state={showNew && !looping ? "active" : "idle"} title="capability" sub="tools/call" />
              <SvgNode box={nTask} role="task" state={looping ? "active" : "idle"} title="task" sub="durable" />
              <SvgNode box={nDone} role="server" state="idle" title="result" />
              <SvgNode box={nInput} role="human" state={looping ? "active" : "idle"} title="input_required" />
            </Fade>

            {/* voices above the agent */}
            <Fade show={showVoices}>
              <Wire d={line(anchor(nHuman, "bottom"), anchor(nAgent, "top", -40))} role="human" state="on" flow={index === 2 ? "once" : null} runKey={runKey} speed={640} />
              <Wire d={line(anchor(nApp, "bottom"), anchor(nAgent, "top"))} role="event" state="on" flow={index === 2 ? "once" : null} runKey={`${runKey}-a`} speed={700} />
              <Wire d={line(anchor(nModel, "bottom"), anchor(nAgent, "top", 40))} role="model" state="on" flow={index === 2 ? "once" : null} runKey={`${runKey}-m`} speed={760} />
              <SvgNode box={nHuman} role="human" state="idle" title="Human" />
              <SvgNode box={nApp} role="event" state="idle" title="MCP App" />
              <SvgNode box={nModel} role="model" state="idle" title="Model" />
            </Fade>

            {/* the loop back */}
            {looping ? (
              <>
                <Wire
                  key={`loop2-${runKey}`}
                  d={`M ${nDone.x} ${nDone.y + 22} C ${nDone.x} ${nDone.y + 70}, 320 460, 300 300 C 288 200, 380 140, ${nAgent.x - 76} ${nAgent.y + 8}`}
                  role="event"
                  state="on"
                  flow="loop"
                  runKey={runKey}
                  speed={2000}
                />
                <Chip x={318} y={252} text="event / result" role="event" />
                <Chip x={600} y={444} text="→ decide → next capability" role="agent" tone="solid" />
              </>
            ) : null}

            <Fade show={showNew && !looping}>
              <Label x={600} y={430} emph>
                the 2026 mental model
              </Label>
            </Fade>

            <Caption x={W / 2} y={H - 10}>
              {looping
                ? "no hidden distributed session anywhere in this loop — only explicit objects"
                : showNew
                  ? "a call has three futures, not one"
                  : "true, useful — and no longer the whole story"}
            </Caption>
          </>
        );
      }}
    </Scene>
  );
}
