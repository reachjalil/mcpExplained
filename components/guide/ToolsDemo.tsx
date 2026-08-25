"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { RectButton } from "@/components/machine/buttons";

/** tools: one button per spec method. list discovers, call executes. */
export function ToolsDemo() {
  const { stageRef, actor, fly, pulse, chip, wait } = useStage();
  const [listed, setListed] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const list = async () => {
    if (busy) return;
    setBusy(true);
    await fly({ from: "agent", to: "server", tag: "tools/list" });
    pulse("server");
    await wait(280);
    await fly({ from: "server", to: "agent", kind: "res", tag: "2 tools" });
    chip("agent", "search_files · read_file", "res");
    setListed(true);
    setBusy(false);
  };

  const call = async () => {
    if (busy) return;
    setBusy(true);
    await fly({ from: "agent", to: "server", tag: "tools/call" });
    pulse("server");
    await wait(380);
    await fly({ from: "server", to: "agent", kind: "res", tag: "result" });
    pulse("agent");
    setResult('search_files("invoice") → 2 matches');
    setBusy(false);
  };

  return (
    <Machine
      stageRef={stageRef}
      label="Discover, then execute"
      controls={
        <>
          <RectButton onClick={list} disabled={busy} tone="amber">
            tools/list
          </RectButton>
          <RectButton onClick={call} disabled={busy || !listed}>
            tools/call
          </RectButton>
        </>
      }
      rule={
        <div className="mnote" data-show={result !== null}>
          <div className="mnote-inner">
            <span className="mnote-k">last result</span>
            <span key={result ?? ""} className="mnote-v">
              {result}
            </span>
          </div>
        </div>
      }
      caption="tools/call stays greyed out until the list has been fetched: you can only call what discovery returned"
    >
      <Actor refCb={actor("agent")} kind="agent" name="host" />
      <Actor refCb={actor("server")} kind="server" name="files" />
    </Machine>
  );
}
