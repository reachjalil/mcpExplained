"use client";

import { useRef, useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { RectButton, Toggle } from "@/components/machine/buttons";

/** The two copies are the concept: the server's document moves on, the
 *  host's copy visibly goes stale, and the subscription is what tells
 *  you to read again. */
export function ResourcesDemo() {
  const { stageRef, actor, fly, pulse, chip } = useStage();
  const [serverV, setServerV] = useState(1);
  const [hostV, setHostV] = useState<number | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [bump, setBump] = useState(0);
  const [busy, setBusy] = useState(false);
  const pushTimer = useRef(0);

  const read = async () => {
    if (busy) return;
    setBusy(true);
    await fly({ from: "agent", to: "server", tag: "resources/read" });
    pulse("server");
    await fly({ from: "server", to: "agent", kind: "res", tag: `v${serverV}` });
    setHostV(serverV);
    setBusy(false);
  };

  const subscribe = (on: boolean) => {
    setSubscribed(on);
    window.clearTimeout(pushTimer.current);
    if (on) {
      // The document changes on the server's schedule, not yours.
      pushTimer.current = window.setTimeout(async () => {
        setServerV((v) => v + 1);
        setBump((b) => b + 1);
        await fly({ from: "server", to: "agent", tag: "updated" });
        pulse("agent");
        chip("agent", "your copy is stale. read again", "deny");
      }, 1500);
    }
  };

  const stale = hostV !== null && hostV < serverV;

  return (
    <Machine
      stageRef={stageRef}
      label="A document and its copy"
      minHeight={150}
      controls={
        <>
          <RectButton onClick={read} disabled={busy} tone="amber">
            resources/read
          </RectButton>
          <Toggle checked={subscribed} onChange={subscribe}>
            subscribe
          </Toggle>
        </>
      }
      caption="without the subscription the host would keep trusting v1 forever"
    >
      <div className="acol">
        <Actor refCb={actor("agent")} kind="agent" name="host" />
        <span className="doccard" data-ghost={hostV === null} aria-live="polite">
          {hostV === null ? (
            "no copy yet"
          ) : (
            <>
              report.md <span className="v">v{hostV}</span>
              {stale ? <span className="stale">stale</span> : null}
            </>
          )}
        </span>
      </div>
      <div className="acol">
        <Actor refCb={actor("server")} kind="server" name="notes" />
        <span key={bump} className={bump ? "doccard bump" : "doccard"}>
          report.md <span className="v">v{serverV}</span>
        </span>
      </div>
    </Machine>
  );
}
