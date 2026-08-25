"use client";

import { useRef, useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { RectButton } from "@/components/machine/buttons";

/** utilities: progress notifications tick in, and cancellation actually
 *  stops the work. */
export function ProgressDemo() {
  const { stageRef, actor, fly, pulse, chip, wait } = useStage();
  const [p, setP] = useState(0);
  const [state, setState] = useState<"idle" | "running" | "done" | "cancelled">(
    "idle",
  );
  const cancelled = useRef(false);

  const run = async () => {
    if (state === "running") return;
    cancelled.current = false;
    setState("running");
    setP(0);
    await fly({ from: "agent", to: "server", tag: "generate_report" });
    pulse("server");
    for (const step of [0.25, 0.5, 0.75]) {
      await wait(650);
      if (cancelled.current) return;
      await fly({ from: "server", to: "agent", tag: `progress ${step * 100}%`, duration: 480 });
      if (cancelled.current) return;
      setP(step);
    }
    await wait(650);
    if (cancelled.current) return;
    await fly({ from: "server", to: "agent", kind: "res", tag: "report" });
    pulse("agent");
    setP(1);
    setState("done");
  };

  const cancel = async () => {
    if (state !== "running") return;
    cancelled.current = true;
    setState("cancelled");
    await fly({ from: "agent", to: "server", tag: "cancelled", duration: 460 });
    pulse("server", "deny-shake");
    chip("server", "work stops, no result comes", "deny");
  };

  return (
    <Machine
      stageRef={stageRef}
      label="Long work, kept honest"
      controls={
        <>
          <RectButton onClick={run} disabled={state === "running"} tone="amber">
            {state === "done" || state === "cancelled" ? "run again" : "call a slow tool"}
          </RectButton>
          <RectButton onClick={cancel} disabled={state !== "running"} tone="red">
            cancel
          </RectButton>
          <span
            className="pbar"
            data-state={state === "cancelled" ? "cancelled" : state === "done" ? "done" : "running"}
            role="progressbar"
            aria-valuenow={Math.round(p * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ "--p": p } as React.CSSProperties}
          >
            <i />
          </span>
        </>
      }
      caption="each tick is a notifications/progress message. cancel and the last flight never arrives"
    >
      <Actor refCb={actor("agent")} kind="agent" name="host" />
      <Actor refCb={actor("server")} kind="server" name="reports" />
    </Machine>
  );
}
