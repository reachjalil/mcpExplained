"use client";

import { Scene } from "@/components/scene/Scene";
import { Caption, Chip, Fade, Label, SvgNode, Wire } from "@/components/scene/svg";
import { anchor, curveH, line, type Box } from "@/components/scene/geometry";
import type { SceneStep } from "@/components/scene/types";

const W = 880;
const H = 440;

const agent: Box = { x: 150, y: 150, w: 138, h: 56 };
const server: Box = { x: 560, y: 84, w: 168, h: 52 };
const taskBox: Box = { x: 560, y: 210, w: 190, h: 64 };

const call = curveH(anchor(agent, "right", -12), anchor(server, "left", -6));
const handleBack = curveH(anchor(server, "left", 14), anchor(agent, "right", 10));
const poll = line(anchor(agent, "bottom"), { x: 150, y: 322 });

// Timeline of other work the agent does while the task runs.
const LANES = [
  { y: 322, label: "query CRM", role: "server" as const, from: 210, to: 400 },
  { y: 354, label: "update project doc", role: "server" as const, from: 250, to: 470 },
  { y: 386, label: "financial analysis task", role: "task" as const, from: 230, to: 560 },
];

const STATES = ["working", "working", "input_required", "working", "completed"] as const;

const steps: SceneStep[] = [
  {
    id: "call",
    label: "Long call",
    title: "Some work does not fit inside a request.",
    body: (
      <>
        <code>analyze_repository()</code> will take twenty minutes. Holding an
        HTTP request open that long means timeouts, retries and a blocked
        agent.
      </>
    ),
    hold: 3200,
  },
  {
    id: "handle",
    label: "Task handle",
    title: "So the server answers immediately — with a task, not a result.",
    body: (
      <>
        <code>resultType: &quot;task&quot;</code> plus a <code>taskId</code>.
        The work has become a durable object with a lifecycle, not a connection
        that must be kept alive.
      </>
    ),
    hold: 3800,
  },
  {
    id: "parallel",
    label: "Agent moves on",
    title: "The agent files the handle and keeps composing.",
    body: "A CRM query, a document update, a second long-running task — all started while the first one grinds away. This is composition across time, not just across servers.",
    hold: 4200,
  },
  {
    id: "input",
    label: "input_required",
    title: "Tasks can pause on the same primitive calls use.",
    body: (
      <>
        The task hits a fork and moves to <code>input_required</code>. The same
        routing question returns: agent, model or human — and the rest of the
        board keeps running while it waits.
      </>
    ),
    hold: 4000,
  },
  {
    id: "done",
    label: "Completed",
    title: "The task completes; the agent collects the result and continues.",
    body: (
      <>
        <code>tasks/get</code> (or, on the roadmap, an event) delivers the
        outcome. Cancellation is first-class too: <code>tasks/cancel</code>{" "}
        instead of killing a connection.
      </>
    ),
    hold: 4000,
  },
];

export function TaskScene() {
  return (
    <Scene
      id="fig-tasks"
      fig="Fig. 7"
      title="Work as a durable object"
      hint="Tasks give long-running work a handle, a state machine, and a polite way to wait."
      accent="task"
      steps={steps}
      viewBox={`0 0 ${W} ${H}`}
    >
      {({ index, runKey }) => {
        const state = STATES[index];
        const taskVisible = index >= 1;
        const lanesVisible = index >= 2;

        return (
          <>
            <Wire
              key={`call-${runKey}`}
              d={call}
              role="agent"
              state={index === 0 ? "on" : "off"}
              flow={index === 0 ? "once" : null}
              dot
              runKey={runKey}
              speed={820}
            />
            <Wire
              key={`hb-${runKey}`}
              d={handleBack}
              role="task"
              state={index === 1 ? "on" : index === 4 ? "on" : "off"}
              flow={index === 1 || index === 4 ? "once" : null}
              dot
              runKey={runKey}
              speed={820}
            />

            <SvgNode
              box={agent}
              role="agent"
              state="active"
              title="Agent"
              sub={index >= 2 ? "not blocked" : "caller"}
            />
            <SvgNode
              box={server}
              role="server"
              state={index === 0 || index === 1 ? "active" : "idle"}
              title="Analysis MCP server"
              sub="tools/call"
            />

            {/* The task object */}
            <Fade show={taskVisible}>
              <SvgNode
                box={taskBox}
                role={state === "input_required" ? "human" : "task"}
                state={
                  state === "completed"
                    ? "done"
                    : state === "input_required"
                      ? "active"
                      : "active"
                }
                title="task 7865-12"
                sub="durable state machine"
                badge={state}
              />
            </Fade>

            {index === 0 ? (
              <Chip x={352} y={64} text="analyze_repository()" role="agent" tone="solid" />
            ) : null}
            {index === 1 ? (
              <>
                <Chip x={330} y={196} text='resultType: "task"' role="task" tone="solid" />
                <Chip x={330} y={228} text='taskId: "7865-12"' role="task" />
              </>
            ) : null}
            {state === "input_required" ? (
              <Chip
                x={560}
                y={278}
                text="needs: which branch is canonical?"
                role="human"
              />
            ) : null}
            {index === 4 ? (
              <Chip x={330} y={196} text="tasks/get → result" role="task" tone="solid" />
            ) : null}

            {/* Parallel lanes */}
            <Fade show={lanesVisible}>
              <Wire d={poll} role="neutral" state="off" arrow={false} dashed />
              <Label x={54} y={306} anchor="start" emph>
                meanwhile, on the agent&apos;s clock
              </Label>
              {LANES.map((lane, i) => {
                const active =
                  (index === 2 && i <= 1) || index >= 3 ? true : i === 0;
                const w = active ? lane.to - lane.from : 26;
                return (
                  <g key={lane.label}>
                    <Label x={lane.from - 10} y={lane.y} anchor="end">
                      {lane.label}
                    </Label>
                    <rect
                      className="sv-bar"
                      x={lane.from}
                      y={lane.y - 7}
                      width={w}
                      height={14}
                      rx={7}
                      style={{
                        fill: `color-mix(in oklab, var(--${lane.role}) ${
                          active ? 55 : 25
                        }%, var(--panel-2))`,
                      }}
                    />
                    {index >= 4 && i === 2 ? (
                      <Chip
                        x={lane.to + 46}
                        y={lane.y}
                        text="still running"
                        role="task"
                        fontSize={9}
                      />
                    ) : null}
                  </g>
                );
              })}
            </Fade>

            {index >= 2 ? (
              <Caption x={W / 2} y={H - 14}>
                one context, many concurrent handles — nothing here blocks
                anything else
              </Caption>
            ) : null}
          </>
        );
      }}
    </Scene>
  );
}
