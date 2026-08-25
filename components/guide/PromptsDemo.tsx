"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { RectButton } from "@/components/machine/buttons";

/** prompts: user-invoked templates the server fills in. */
export function PromptsDemo() {
  const { stageRef, actor, fly, pulse, chip, wait } = useStage();
  const [listed, setListed] = useState(false);
  const [filled, setFilled] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const list = async () => {
    if (busy) return;
    setBusy(true);
    await fly({ from: "agent", to: "server", tag: "prompts/list" });
    pulse("server");
    await wait(280);
    await fly({ from: "server", to: "agent", kind: "res", tag: "2 prompts" });
    chip("agent", "summarize · translate", "res");
    setListed(true);
    setBusy(false);
  };

  const get = async () => {
    if (busy) return;
    setBusy(true);
    await fly({ from: "agent", to: "server", tag: "prompts/get" });
    pulse("server");
    await wait(300);
    await fly({ from: "server", to: "agent", kind: "res", tag: "messages" });
    pulse("agent");
    setFilled('user: "Summarize report.md in three bullets."');
    setBusy(false);
  };

  return (
    <Machine
      stageRef={stageRef}
      label="A template, filled by the server"
      controls={
        <>
          <RectButton onClick={list} disabled={busy} tone="amber">
            prompts/list
          </RectButton>
          <RectButton onClick={get} disabled={busy || !listed}>
            prompts/get summarize
          </RectButton>
        </>
      }
      rule={
        <div className="mnote" data-show={filled !== null}>
          <div className="mnote-inner">
            <span className="mnote-k">ready to send</span>
            <span key={filled ?? ""} className="mnote-v">
              {filled}
            </span>
          </div>
        </div>
      }
      caption="the server returns finished messages. the person picks the template; the model never chooses prompts"
    >
      <Actor refCb={actor("agent")} kind="agent" name="host" />
      <Actor refCb={actor("server")} kind="server" name="notes" />
    </Machine>
  );
}
