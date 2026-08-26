"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { RectButton } from "@/components/machine/buttons";

const CLIENT_CAPS: Array<[string, string]> = [
  ["sampling", "#g-sampling"],
  ["elicitation", "#g-elicitation"],
  ["roots", "#g-roots"],
];

const SERVER_CAPS: Array<[string, string]> = [
  ["tools", "#g-tools"],
  ["resources", "#g-resources"],
  ["prompts", "#g-prompts"],
];

type SessionState = "idle" | "connecting" | "open";

const STATE_LABEL: Record<SessionState, string> = {
  idle: "no session",
  connecting: "initializing…",
  open: "session open",
};

/**
 * The lifecycle, played straight from the spec: initialize carries the
 * client's declarations, the result carries the server's, and the
 * initialized notification opens the session. Every capability pill is a
 * link to its concept card below.
 */
export function HandshakeDemo() {
  const { stageRef, actor, fly, pulse, wait } = useStage();
  const [state, setState] = useState<SessionState>("idle");
  const [clientDeclared, setClientDeclared] = useState(false);
  const [serverDeclared, setServerDeclared] = useState(false);

  const connect = async () => {
    if (state === "connecting") return;
    setState("connecting");
    setClientDeclared(false);
    setServerDeclared(false);
    await wait(80);
    await fly({ from: "agent", to: "server", tag: "initialize" });
    pulse("server");
    setClientDeclared(true); // the request carried these
    await wait(480);
    await fly({ from: "server", to: "agent", kind: "res", tag: "capabilities" });
    pulse("agent");
    setServerDeclared(true); // the result carried these
    await wait(480);
    await fly({ from: "agent", to: "server", tag: "initialized", duration: 440 });
    pulse("server");
    setState("open");
  };

  const pills = (caps: Array<[string, string]>) =>
    caps.map(([name, href], i) => (
      <a key={name} href={href} style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
        {name}
      </a>
    ));

  return (
    <Machine
      stageRef={stageRef}
      label="Opening a session"
      minHeight={196}
      controls={
        <RectButton onClick={connect} disabled={state === "connecting"} tone="amber">
          {state === "open" ? "reconnect" : "connect"}
        </RectButton>
      }
      caption="the pills are live: each one links to its concept below"
    >
      <span className="sstate" data-s={state} aria-live="polite">
        <i aria-hidden="true" />
        {STATE_LABEL[state]}
      </span>
      <div className="acol">
        <Actor refCb={actor("agent")} kind="agent" name="host · client" />
        <span className="capk">client declares</span>
        <div className="cappills">
          {clientDeclared ? pills(CLIENT_CAPS) : null}
        </div>
      </div>
      <div className="acol">
        <Actor refCb={actor("server")} kind="server" name="server" />
        <span className="capk">server declares</span>
        <div className="cappills">
          {serverDeclared ? pills(SERVER_CAPS) : null}
        </div>
      </div>
    </Machine>
  );
}
