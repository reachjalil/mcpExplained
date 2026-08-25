"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { RectButton } from "@/components/machine/buttons";

const CLIENT_CAPS = ["sampling", "elicitation", "roots"];
const SERVER_CAPS = ["tools", "resources", "prompts"];

/** The handshake's animation is the concept: capabilities are declared
 *  once, up front, and stamp in under the side that owns them. */
export function HandshakeDemo() {
  const { stageRef, actor, fly, pulse, wait } = useStage();
  const [phase, setPhase] = useState<"idle" | "client" | "done">("idle");
  const [busy, setBusy] = useState(false);

  const connect = async () => {
    if (busy) return;
    setBusy(true);
    setPhase("idle");
    await wait(80);
    await fly({ from: "agent", to: "server", tag: "initialize" });
    pulse("server");
    setPhase("client"); // the request carried the client's declarations
    await wait(500);
    await fly({ from: "server", to: "agent", kind: "res", tag: "capabilities" });
    pulse("agent");
    setPhase("done");
    setBusy(false);
  };

  return (
    <Machine
      stageRef={stageRef}
      label="The initialize handshake"
      minHeight={150}
      controls={
        <RectButton onClick={connect} disabled={busy} tone="amber">
          {phase === "done" ? "reconnect" : "connect"}
        </RectButton>
      }
      caption="neither side may use anything the other didn't declare here"
    >
      <div className="acol">
        <Actor refCb={actor("agent")} kind="agent" name="host · client" />
        <div className="cappills" aria-live="polite">
          {phase !== "idle"
            ? CLIENT_CAPS.map((c, i) => (
                <span key={c} style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
                  {c}
                </span>
              ))
            : null}
        </div>
      </div>
      <div className="acol">
        <Actor refCb={actor("server")} kind="server" name="server" />
        <div className="cappills" aria-live="polite">
          {phase === "done"
            ? SERVER_CAPS.map((c, i) => (
                <span key={c} style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
                  {c}
                </span>
              ))
            : null}
        </div>
      </div>
    </Machine>
  );
}
