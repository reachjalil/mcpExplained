"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Actor } from "@/components/machine/Machine";
import { Overture } from "@/components/machine/Overture";
import { ShapeButton } from "@/components/machine/buttons";

const LINES = [
  "Ask the weather server directly.",
  "Blocked. No line runs from you to a server.",
  "Delivered through the agent. Every request takes that path.",
];

/**
 * Fig. 00 for "Who can talk to whom?".
 *
 * One click plays the whole argument. The reader asks the server directly
 * and the request dies halfway. The agent fades into the gap the failure
 * marked, and the same request retries the only way that works: through
 * the middle, delivered. Clicking again replays the working path.
 *
 * The middle slot is laid out from first paint, so revealing the agent
 * moves nothing on the page.
 */
export function TalkOverture() {
  const { stageRef, actor, fly, deny, pulse, wait } = useStage();
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);

  const viaAgent = async () => {
    await fly({ from: "you", to: "agent", duration: 460 });
    pulse("agent");
    await wait(200);
    await fly({ from: "agent", to: "weather", duration: 460 });
    pulse("weather");
  };

  const send = async () => {
    if (busy) return;
    setBusy(true);

    if (!revealed) {
      // The direct ask dies at the midpoint. The gap it leaves is exactly
      // where the agent belongs.
      const blocked = deny({
        from: "you",
        to: "weather",
        until: 0.5,
        duration: 620,
      });
      await wait(380);
      setStep(1);
      await blocked;
      await wait(360);
      setRevealed(true);
      await wait(500);
      // Same request, retried the only way that works.
      await viaAgent();
      setStep(2);
    } else {
      await viaAgent();
    }

    setBusy(false);
  };

  return (
    <Overture
      stageRef={stageRef}
      label="asking a server directly"
      prompt={LINES[step]}
      tone={step === 0 ? "ask" : step === 1 ? "blocked" : "done"}
    >
      <ShapeButton
        refCb={actor("you")}
        onClick={send}
        hint={step === 0}
        label="Send your request to the weather server"
      />
      <Actor
        className={revealed ? "ov-mid on" : "ov-mid"}
        refCb={actor("agent")}
        kind="agent"
        name="agent"
      />
      <Actor refCb={actor("weather")} kind="server" name="weather" />
    </Overture>
  );
}
