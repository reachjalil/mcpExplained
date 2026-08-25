"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { RectButton } from "@/components/machine/buttons";

/** Basics: one click runs the initialize handshake and shows what each
 *  side declared it can do. */
export function HandshakeDemo() {
  const { stageRef, actor, fly, pulse, chip, wait } = useStage();
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);

  const connect = async () => {
    if (busy) return;
    setBusy(true);
    await fly({ from: "agent", to: "server", tag: "initialize" });
    pulse("server");
    await wait(300);
    await fly({ from: "server", to: "agent", kind: "res", tag: "capabilities" });
    pulse("agent");
    chip("agent", "session open", "res");
    setConnected(true);
    setBusy(false);
  };

  return (
    <Machine
      stageRef={stageRef}
      label="The initialize handshake"
      controls={
        <RectButton onClick={connect} disabled={busy} tone="amber">
          {connected ? "reconnect" : "connect"}
        </RectButton>
      }
      rule={
        <div className="mnote" data-show={connected}>
          <div className="mnote-inner">
            <span className="mnote-k">negotiated</span>
            <span className="mnote-v">
              server: tools · resources · prompts&ensp;|&ensp;client: sampling
              · elicitation · roots
            </span>
          </div>
        </div>
      }
      caption="each side names its capabilities once, up front. everything after is scoped by this exchange"
    >
      <Actor refCb={actor("agent")} kind="agent" name="host · client" />
      <Actor refCb={actor("server")} kind="server" name="server" />
    </Machine>
  );
}
