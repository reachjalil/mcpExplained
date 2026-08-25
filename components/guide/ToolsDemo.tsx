"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { RectButton } from "@/components/machine/buttons";

/** The shelf is the concept: before discovery the server is a mystery;
 *  after tools/list its functions exist, and a call lights one up. */
export function ToolsDemo() {
  const { stageRef, actor, fly, pulse, chip, wait } = useStage();
  const [listed, setListed] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const list = async () => {
    if (busy) return;
    setBusy(true);
    await fly({ from: "agent", to: "server", tag: "tools/list" });
    pulse("server");
    await wait(260);
    await fly({ from: "server", to: "agent", kind: "res", tag: "2 tools" });
    setListed(true);
    setBusy(false);
  };

  const call = async () => {
    if (busy) return;
    setBusy(true);
    setActive("search_files");
    await fly({ from: "agent", to: "server", tag: "tools/call" });
    pulse("server");
    await wait(360);
    await fly({ from: "server", to: "agent", kind: "res", tag: "2 matches" });
    pulse("agent");
    chip("agent", 'search_files("invoice") ✓', "res");
    window.setTimeout(() => setActive(null), 900);
    setBusy(false);
  };

  return (
    <Machine
      stageRef={stageRef}
      label="Discover, then execute"
      minHeight={150}
      controls={
        <>
          <RectButton onClick={list} disabled={busy || listed} tone="amber">
            tools/list
          </RectButton>
          <RectButton onClick={call} disabled={busy || !listed}>
            tools/call
          </RectButton>
        </>
      }
      caption="call stays locked until the list exists: you can only call what discovery returned"
    >
      <Actor refCb={actor("agent")} kind="agent" name="host" />
      <div className="acol">
        <Actor refCb={actor("server")} kind="server" name="files" />
        <div className="shelf" aria-live="polite">
          {listed ? (
            <>
              <span className="shelf-item" data-on={active === "search_files"} style={{ "--d": "0ms" } as React.CSSProperties}>
                <i aria-hidden="true" />
                search_files
              </span>
              <span className="shelf-item" data-on={false} style={{ "--d": "90ms" } as React.CSSProperties}>
                <i aria-hidden="true" />
                read_file
              </span>
            </>
          ) : (
            <span className="shelf-empty">tools unknown</span>
          )}
        </div>
      </div>
    </Machine>
  );
}
