"use client";

import { Scene } from "@/components/scene/Scene";
import {
  Caption,
  Chip,
  Fade,
  Label,
  Strike,
  SvgNode,
  Wire,
  Zone,
} from "@/components/scene/svg";
import { anchor, arc, curveH, line, type Box } from "@/components/scene/geometry";
import type { SceneStep } from "@/components/scene/types";

const W = 880;
const H = 420;

const agent: Box = { x: 150, y: 200, w: 132, h: 54 };
const lb: Box = { x: 452, y: 200, w: 116, h: 40 };
const replicas: Box[] = [
  { x: 732, y: 96, w: 142, h: 50 },
  { x: 732, y: 200, w: 142, h: 50 },
  { x: 732, y: 304, w: 142, h: 50 },
];
const subs: Box[] = [
  { x: 452, y: 104, w: 128, h: 46 },
  { x: 452, y: 300, w: 128, h: 46 },
];

const toLb = line(anchor(agent, "right"), anchor(lb, "left"));
const fromLb = replicas.map((r) => curveH(anchor(lb, "right"), anchor(r, "left")));
const backTo = replicas.map((r) =>
  arc(anchor(r, "left", 14), anchor(agent, "right", 14), 34),
);
const toSubs = subs.map((s) => curveH(anchor(agent, "right"), anchor(s, "left")));

const steps: SceneStep[] = [
  {
    id: "session",
    label: "Implicit session",
    title: "The old shape: the server quietly remembers who you are.",
    body: (
      <>
        <code>add_item(&quot;shoes&quot;)</code> means something only because
        replica&nbsp;A is holding <code>session_123</code> in memory — the
        basket, the step you are on, the whole thread of the conversation.
      </>
    ),
    hold: 3600,
  },
  {
    id: "lost",
    label: "Wrong replica",
    title: "Scale it out and the next call lands somewhere else.",
    body: "Replica B never saw that session. Nothing is wrong with the request — it simply arrived at a machine that does not hold the context it depends on.",
    hold: 3600,
  },
  {
    id: "create",
    label: "Create a handle",
    title: "Sessionless MCP makes the state an object with a name.",
    body: (
      <>
        <code>create_basket()</code> returns <code>basket_id</code>. The state
        still exists — it just stopped being a hidden property of the
        connection and became something addressable.
      </>
    ),
    hold: 3800,
  },
  {
    id: "carry",
    label: "Carry it",
    title: "Now the agent carries the thread, and any replica can serve it.",
    body: (
      <>
        <code>add_item(basket_id, sku)</code> lands on replica&nbsp;A this time
        and works, because every fact the server needs is present in the
        request itself.
      </>
    ),
    hold: 3800,
  },
  {
    id: "anywhere",
    label: "Any replica",
    title: "Two calls, two machines, one basket.",
    body: "The object is addressable rather than the connection being sticky. Load balancing, restarts and cold starts stop being correctness problems.",
    hold: 3400,
  },
  {
    id: "share",
    label: "Share or isolate",
    title: "And because handles are just values, sharing becomes a decision.",
    body: "Hand the same handle to two sub-agents and they work on the same object. Give one its own and it is isolated. The composer chooses — per handle, per sub-agent.",
    hold: 4200,
  },
];

export function HandleScene() {
  return (
    <Scene
      id="fig-handles"
      fig="Fig. 3"
      title="What replaced the session"
      hint="From state hidden inside a process to state you can pass around."
      accent="server"
      steps={steps}
      viewBox={`0 0 ${W} ${H}`}
    >
      {({ index, runKey }) => {
        const hit =
          index === 0 ? 0 : index === 1 ? 1 : index === 2 ? 2 : index === 3 ? 0 : -1;
        const bothHit = index === 4;
        const sharing = index === 5;
        const handleHeld = index >= 3;

        return (
          <>
            <Zone
              x={54}
              y={262}
              w={200}
              h={112}
              role="agent"
              label="state the agent holds"
              opacity={index >= 2 ? 1 : 0.35}
            />
            {index >= 2 ? (
              <Chip
                x={154}
                y={306}
                text="basket_id bsk_a1b2c3"
                role="agent"
                fontSize={9.5}
              />
            ) : (
              <Label x={154} y={306}>
                (empty — the server remembers)
              </Label>
            )}
            {sharing ? (
              <Chip
                x={154}
                y={340}
                text="doc_id doc_77f0"
                role="server"
                fontSize={9.5}
              />
            ) : null}

            {/* Request path */}
            <Fade show={!sharing}>
              <Wire
                key={`lb-${runKey}`}
                d={toLb}
                role={index === 1 ? "danger" : "agent"}
                state={index === 5 ? "off" : "on"}
                flow={index === 5 ? null : "once"}
                dot
                runKey={runKey}
                speed={700}
              />
              {replicas.map((_, i) => (
                <Wire
                  key={`fan-${i}-${runKey}`}
                  d={fromLb[i]}
                  role={
                    i === hit || (bothHit && (i === 0 || i === 2))
                      ? i === 1 && index === 1
                        ? "danger"
                        : "server"
                      : "neutral"
                  }
                  state={
                    i === hit || (bothHit && (i === 0 || i === 2)) ? "on" : "off"
                  }
                  flow={
                    i === hit || (bothHit && (i === 0 || i === 2)) ? "once" : null
                  }
                  runKey={`${runKey}-${i}`}
                  speed={760}
                />
              ))}
            </Fade>

            {/* Handle coming back */}
            {index === 2 ? (
              <Wire
                key={`ret-${runKey}`}
                d={backTo[2]}
                role="server"
                state="on"
                flow="once"
                dot
                runKey={runKey}
                speed={950}
              />
            ) : null}

            {/* Sub-agent fan-out */}
            <Fade show={sharing}>
              {toSubs.map((d, i) => (
                <Wire
                  key={`sub-${i}-${runKey}`}
                  d={d}
                  role={i === 0 ? "agent" : "server"}
                  state="on"
                  flow="once"
                  runKey={`${runKey}-s${i}`}
                  speed={820}
                />
              ))}
            </Fade>

            {/* Nodes */}
            <SvgNode
              box={agent}
              role="agent"
              state="active"
              title="Agent"
              sub={sharing ? "orchestrator" : "client"}
            />

            <Fade show={!sharing}>
              <SvgNode
                box={lb}
                role="neutral"
                state="idle"
                title="load balancer"
              />
            </Fade>

            <Fade show={sharing}>
              {subs.map((b, i) => (
                <SvgNode
                  key={`subnode-${i}`}
                  box={b}
                  role={i === 0 ? "agent" : "server"}
                  state="active"
                  title={i === 0 ? "Sub-agent A" : "Sub-agent B"}
                  sub={i === 0 ? "shares bsk_a1b2c3" : "own doc_77f0"}
                />
              ))}
            </Fade>

            {replicas.map((b, i) => (
              <SvgNode
                key={`rep-${i}`}
                box={b}
                role={i === 1 && index === 1 ? "danger" : "server"}
                state={
                  sharing
                    ? "dim"
                    : i === hit
                      ? index === 1
                        ? "error"
                        : "active"
                      : bothHit && (i === 0 || i === 2)
                        ? "active"
                        : "idle"
                }
                title={`Replica ${String.fromCharCode(65 + i)}`}
                sub={index <= 1 ? "in-memory session" : "no session state"}
                badge={index === 0 && i === 0 ? "session_123" : undefined}
              />
            ))}

            {/* Annotations */}
            {index === 0 ? (
              <Chip
                x={520}
                y={368}
                text='add_item("shoes")'
                role="agent"
                tone="solid"
              />
            ) : null}
            {index === 1 ? (
              <>
                <Strike x={732} y={200} size={15} />
                <Chip
                  x={732}
                  y={252}
                  text="error: session not found"
                  role="danger"
                />
              </>
            ) : null}
            {index === 2 ? (
              <Chip x={560} y={368} text="create_basket()" role="agent" tone="solid" />
            ) : null}
            {index === 3 ? (
              <Chip
                x={560}
                y={368}
                text='add_item(bsk_a1b2c3, "shoes")'
                role="agent"
                tone="solid"
              />
            ) : null}
            {bothHit ? (
              <Chip x={560} y={368} text="same basket_id, two machines" role="server" />
            ) : null}

            {handleHeld && !sharing ? (
              <Caption x={W / 2} y={396}>
                nothing about this request depends on which machine served the
                last one
              </Caption>
            ) : null}
            {sharing ? (
              <Caption x={W / 2} y={396}>
                what is shared and what is isolated is now a composition choice
              </Caption>
            ) : null}
          </>
        );
      }}
    </Scene>
  );
}
