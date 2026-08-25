"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { RectButton } from "@/components/machine/buttons";

/** sampling: the server asks the host to run the model. You are the gate. */
export function SamplingDemo() {
  const { stageRef, actor, fly, deny, pulse, chip, wait } = useStage();
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [busy, setBusy] = useState(false);

  const request = async () => {
    if (busy || pending) return;
    setBusy(true);
    await fly({ from: "server", to: "agent", tag: "createMessage" });
    pulse("agent");
    setPending(true);
    setBusy(false);
  };

  const approve = async () => {
    setPending(false);
    setBusy(true);
    setThinking(true);
    chip("agent", "the model runs in here", "ink");
    await wait(1300);
    setThinking(false);
    await fly({ from: "agent", to: "server", kind: "res", tag: "completion" });
    pulse("server");
    setOutcome("the server got a completion. it never saw the model, a key, or your context");
    setBusy(false);
  };

  const refuse = async () => {
    setPending(false);
    setBusy(true);
    await deny({ from: "agent", to: "server", until: 0.45, duration: 480 });
    setOutcome("refused. the server gets an error, nothing else");
    setBusy(false);
  };

  return (
    <Machine
      stageRef={stageRef}
      label="A server borrowing the model"
      controls={
        <>
          <RectButton onClick={request} disabled={busy || pending} tone="amber">
            server requests sampling
          </RectButton>
          <div className="drawer" data-open={pending} style={{ flexBasis: "100%" }}>
            <div>
              <div className="drawer-inner">
                <span className="dq">
                  notes wants the model to summarize a doc. allow it?
                </span>
                <span className="dbtns">
                  <RectButton onClick={approve}>allow</RectButton>
                  <RectButton onClick={refuse} tone="red">
                    refuse
                  </RectButton>
                </span>
              </div>
            </div>
          </div>
        </>
      }
      rule={
        <div className="mnote" data-show={outcome !== null}>
          <div className="mnote-inner">
            <span className="mnote-k">outcome</span>
            <span key={outcome ?? ""} className="mnote-v">
              {outcome}
            </span>
          </div>
        </div>
      }
      caption="watch the ring while it runs: the model never leaves the host"
    >
      <Actor
        refCb={actor("agent")}
        kind="agent"
        name="host · model inside"
        className={thinking ? "acthink" : ""}
      />
      <Actor refCb={actor("server")} kind="server" name="notes" />
    </Machine>
  );
}
