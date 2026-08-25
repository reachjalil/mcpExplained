"use client";

import { useRef, useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { RectButton, Toggle } from "@/components/machine/buttons";

/** resources: read-only context, and the subscription that keeps it fresh. */
export function ResourcesDemo() {
  const { stageRef, actor, fly, pulse, chip, wait } = useStage();
  const [listed, setListed] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const version = useRef(1);
  const pushTimer = useRef(0);

  const list = async () => {
    if (busy) return;
    setBusy(true);
    await fly({ from: "agent", to: "server", tag: "resources/list" });
    pulse("server");
    await wait(280);
    await fly({ from: "server", to: "agent", kind: "res", tag: "1 resource" });
    chip("agent", "notes://report.md", "res");
    setListed(true);
    setBusy(false);
  };

  const read = async () => {
    if (busy) return;
    setBusy(true);
    await fly({ from: "agent", to: "server", tag: "resources/read" });
    pulse("server");
    await wait(320);
    await fly({ from: "server", to: "agent", kind: "res" });
    setContent(`report.md · v${version.current}`);
    setBusy(false);
  };

  const subscribe = (on: boolean) => {
    setSubscribed(on);
    window.clearTimeout(pushTimer.current);
    if (on) {
      // The server pushes an update notification on its own schedule —
      // no request precedes this flight.
      pushTimer.current = window.setTimeout(async () => {
        version.current += 1;
        await fly({ from: "server", to: "agent", tag: "updated" });
        pulse("agent");
        chip("agent", "resource changed, re-read it", "ink");
      }, 1600);
    }
  };

  return (
    <Machine
      stageRef={stageRef}
      label="Context the host can read"
      controls={
        <>
          <RectButton onClick={list} disabled={busy} tone="amber">
            resources/list
          </RectButton>
          <RectButton onClick={read} disabled={busy || !listed}>
            resources/read
          </RectButton>
          <Toggle checked={subscribed} onChange={subscribe}>
            subscribe
          </Toggle>
        </>
      }
      rule={
        <div className="mnote" data-show={content !== null}>
          <div className="mnote-inner">
            <span className="mnote-k">in context</span>
            <span key={content ?? ""} className="mnote-v">
              {content}
            </span>
          </div>
        </div>
      }
      caption="flip subscribe and wait a beat: the server sends notifications/resources/updated without being asked"
    >
      <Actor refCb={actor("agent")} kind="agent" name="host" />
      <Actor refCb={actor("server")} kind="server" name="notes" />
    </Machine>
  );
}
