"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Actor } from "@/components/machine/Machine";
import { Overture } from "@/components/machine/Overture";
import { ShapeButton } from "@/components/machine/buttons";

const LINES = [
  "Ask the weather server directly.",
  "There's no line from you to a server.",
  "It goes through the agent. Five machines below.",
];

/**
 * Fig. 00 for "Who can talk to whom?".
 *
 * The reader does the obvious thing first — ask the server — and it fails.
 * The agent then fades into the gap the ✕ just marked: it was always the
 * only way across. One click, one motion, no cutscene. The middle slot is
 * laid out from first paint, so revealing the agent moves nothing.
 */
export function TalkOverture() {
  const { stageRef, actor, fly, deny, pulse, wait } = useStage();
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (busy) return;
    setBusy(true);

    if (!revealed) {
      // The ✕ pops at the midpoint; the packet falls; the gap it leaves is
      // exactly where the agent belongs.
      const blocked = deny({
        from: "you",
        to: "weather",
        until: 0.5,
        duration: 620,
      });
      await wait(380);
      setStep(1);
      await blocked;
      await wait(420);
      setRevealed(true);
      await wait(520);
      setStep(2);
    } else {
      // Afterwards the button still works: one hop, into the middle.
      await fly({ from: "you", to: "agent", duration: 500 });
      pulse("agent");
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
