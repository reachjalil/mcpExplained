"use client";

import { Scene } from "@/components/scene/Scene";
import { Caption, Chip, Fade, Label, SvgNode, Wire, Zone } from "@/components/scene/svg";
import { anchor, curveH, line, type Box } from "@/components/scene/geometry";
import type { SceneStep } from "@/components/scene/types";

const W = 880;
const H = 430;

const agent: Box = { x: 130, y: 120, w: 132, h: 54 };
const host: Box = { x: 440, y: 120, w: 140, h: 54 };
const server: Box = { x: 750, y: 120, w: 150, h: 56 };
const app: Box = { x: 440, y: 300, w: 168, h: 62 };
const user: Box = { x: 130, y: 300, w: 132, h: 50 };

const callWire = curveH(anchor(agent, "right", -10), anchor(host, "left", -10));
const hostToServer = curveH(anchor(host, "right", -10), anchor(server, "left", -10));
const serverBack = curveH(anchor(server, "left", 12), anchor(host, "right", 12));
const hostToApp = line(anchor(host, "bottom"), anchor(app, "top"));
const appToUser = line(anchor(app, "left"), anchor(user, "right"));
const userToApp = line(anchor(user, "right", 14), anchor(app, "left", 14));
const appToHost = line(anchor(app, "top", 26), anchor(host, "bottom", 26));

const steps: SceneStep[] = [
  {
    id: "call",
    label: "Tool call",
    title: "A tool result can carry more than data — it can carry an interface.",
    body: (
      <>
        The agent calls <code>pick_seat</code>. Alongside the data, the server
        returns a declared UI resource.
      </>
    ),
    hold: 3000,
  },
  {
    id: "sandbox",
    label: "Sandbox",
    title: "The host renders that UI in a sandbox it controls.",
    body: "The app is the server's code running inside the host's walls. It cannot reach the network or the page around it — everything it does goes through the host.",
    hold: 3600,
  },
  {
    id: "human",
    label: "Human input",
    title: "The user interacts with deterministic software, not with a model.",
    body: "A seat map is a pointing problem, not a prose problem. Some decisions belong to the human on real UI; the model never has to guess a seat number from a description.",
    hold: 3800,
  },
  {
    id: "appcall",
    label: "App-scoped call",
    title: "The app calls a tool — but only through the host, only if visible to it.",
    body: (
      <>
        MCP Apps distinguishes which tools the <em>model</em> may call and which
        the <em>app</em> may call. The host enforces the split; the app cannot
        reach past it.
      </>
    ),
    hold: 4000,
  },
  {
    id: "resume",
    label: "Back to the agent",
    title: "The result rejoins the composition like any other result.",
    body: "Seat 14A confirmed. Three deciders — model, deterministic app, human — and the host is the policy boundary between all of them.",
    hold: 3800,
  },
];

export function AppsScene() {
  return (
    <Scene
      id="fig-apps"
      fig="Fig. 13"
      title="Three kinds of decider, one boundary"
      hint="Where MCP Apps fit into composition."
      accent="event"
      steps={steps}
      viewBox={`0 0 ${W} ${H}`}
    >
      {({ index, runKey }) => {
        return (
          <>
            <Zone
              x={330}
              y={226}
              w={430}
              h={150}
              role="event"
              label="host-controlled sandbox"
              opacity={index >= 1 ? 1 : 0.3}
            />

            <Wire
              key={`c-${runKey}`}
              d={callWire}
              role="agent"
              state={index === 0 ? "on" : "off"}
              flow={index === 0 ? "once" : null}
              dot
              runKey={runKey}
              speed={760}
            />
            <Wire
              key={`hs-${runKey}`}
              d={hostToServer}
              role="agent"
              state={index === 0 || index === 3 ? "on" : "off"}
              flow={index === 0 || index === 3 ? "once" : null}
              runKey={runKey}
              speed={760}
            />
            <Wire
              key={`sb-${runKey}`}
              d={serverBack}
              role="server"
              state={index === 1 || index === 4 ? "on" : "off"}
              flow={index === 1 || index === 4 ? "once" : null}
              dot
              runKey={runKey}
              speed={760}
            />
            <Wire
              key={`ha-${runKey}`}
              d={hostToApp}
              role="event"
              state={index >= 1 && index <= 3 ? "on" : "off"}
              flow={index === 1 ? "once" : null}
              runKey={runKey}
              speed={700}
            />
            <Wire
              key={`au-${runKey}`}
              d={appToUser}
              role="human"
              state={index === 2 ? "on" : "off"}
              flow={index === 2 ? "once" : null}
              runKey={runKey}
              speed={700}
            />
            <Wire
              key={`ua-${runKey}`}
              d={userToApp}
              role="human"
              state={index === 2 || index === 3 ? "on" : "off"}
              flow={index === 2 ? "once" : null}
              runKey={`${runKey}-u`}
              speed={700}
            />
            <Wire
              key={`ah-${runKey}`}
              d={appToHost}
              role="event"
              state={index === 3 ? "on" : "off"}
              flow={index === 3 ? "once" : null}
              dot
              runKey={runKey}
              speed={700}
            />

            <SvgNode
              box={agent}
              role="agent"
              state={index === 0 || index === 4 ? "active" : "dim"}
              title="Agent"
              sub="model decisions"
            />
            <SvgNode
              box={host}
              role="event"
              state="active"
              title="Host"
              sub="policy boundary"
            />
            <SvgNode
              box={server}
              role="server"
              state={index === 0 || index === 1 || index >= 3 ? "active" : "idle"}
              title="Seat-map MCP"
              sub="tools + ui resource"
            />
            <Fade show={index >= 1}>
              <SvgNode
                box={app}
                role="event"
                state={index >= 1 && index <= 3 ? "active" : "done"}
                title="MCP App"
                sub="deterministic UI"
                badge={index >= 1 ? "sandboxed" : undefined}
              />
            </Fade>
            <SvgNode
              box={user}
              role="human"
              state={index === 2 ? "active" : "dim"}
              title="User"
              sub="human decisions"
            />

            {index === 0 ? (
              <Chip x={285} y={70} text="tools/call pick_seat" role="agent" tone="solid" />
            ) : null}
            {index === 1 ? (
              <Chip x={600} y={222} text="ui resource → render" role="event" tone="solid" />
            ) : null}
            {index === 2 ? (
              <Chip x={285} y={252} text="taps seat 14A" role="human" tone="solid" />
            ) : null}
            {index === 3 ? (
              <>
                <Chip x={510} y={210} text="app-visible tool: hold_seat(14A)" role="event" tone="solid" fontSize={9.5} />
                <Label x={620} y={70} emph>
                  model-visible ≠ app-visible
                </Label>
              </>
            ) : null}
            {index === 4 ? (
              <Chip x={285} y={70} text="result: seat 14A held" role="server" tone="solid" />
            ) : null}

            <Caption x={W / 2} y={H - 16}>
              {index >= 3
                ? "every app interaction is routed — the sandbox never talks to the server directly"
                : "some decisions belong to software, some to the model, some to the person"}
            </Caption>
          </>
        );
      }}
    </Scene>
  );
}
