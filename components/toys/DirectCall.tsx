"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { Goals, type GoalState } from "@/components/machine/Goals";
import { ShapeButton } from "@/components/machine/buttons";
import { G } from "@/components/ui/Glyph";

const ANSWERS = ["sunny · 22°", "cloudy · 17°", "rain · 14°", "clear · 19°"];

/** §1 — the only line that exists at the beginning: agent ⇄ server. */
export function DirectCall() {
  const { stageRef, actor, fly, pulse, chip, wait } = useStage();
  const [goals, setGoals] = useState<GoalState>({});
  const [clicked, setClicked] = useState(0);

  const hit = (id: string) =>
    setGoals((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));

  const send = async () => {
    const n = clicked;
    setClicked((c) => c + 1);
    hit("send");
    await fly({ from: "you", to: "agent", duration: 420 });
    pulse("agent");
    await fly({ from: "agent", to: "server" });
    pulse("server");
    await wait(360);
    await fly({ from: "server", to: "agent", kind: "res" });
    pulse("agent");
    await fly({ from: "agent", to: "you", kind: "res", duration: 420 });
    chip("you", ANSWERS[n % ANSWERS.length], "res");
    hit("answer");
  };

  return (
    <>
      <Goals
        state={goals}
        items={[
          {
            id: "send",
            target: 3,
            label: (
              <>
                Send three <G k="request">requests</G> to the weather server.
              </>
            ),
          },
          {
            id: "answer",
            label: (
              <>
                Get a <G k="result">result</G> all the way back.
              </>
            ),
          },
        ]}
      />
      <Machine stageRef={stageRef} label="One agent calling one server">
        <ShapeButton
          refCb={actor("you")}
          onClick={send}
          hint={clicked === 0}
          label="Ask the agent for the weather"
        />
        <Actor refCb={actor("agent")} kind="agent" name="agent" />
        <Actor refCb={actor("server")} kind="server" name="weather" />
      </Machine>
    </>
  );
}
