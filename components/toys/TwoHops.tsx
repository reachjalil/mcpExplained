"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor, Rule } from "@/components/machine/Machine";
import { Goals, type GoalState } from "@/components/machine/Goals";
import { RectButton, Toggle } from "@/components/machine/buttons";

/** §3 — facts travel through the middle. Remove the middle and they don't. */
export function TwoHops() {
  const { stageRef, actor, fly, deny, pulse, chip, wait } = useStage();
  const [goals, setGoals] = useState<GoalState>({});
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);

  const hit = (id: string) =>
    setGoals((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));

  const run = async () => {
    if (busy) return;
    setBusy(true);
    if (removed) {
      // No one holds a connection — the fact is stranded at the source.
      pulse("flights");
      await deny({ from: "flights", to: "agent", until: 0.86 });
      chip("agent", "no path", "deny");
      hit("ghost");
    } else {
      await fly({ from: "agent", to: "flights" });
      pulse("flights");
      await wait(320);
      await fly({ from: "flights", to: "agent", kind: "res", tag: "14:05" });
      pulse("agent");
      await wait(260);
      await fly({ from: "agent", to: "calendar", tag: "14:05" });
      pulse("calendar");
      await wait(320);
      await fly({ from: "calendar", to: "agent", kind: "res" });
      chip("agent", "booked + invited", "res");
      hit("chain");
    }
    setBusy(false);
  };

  return (
    <>
      <Goals
        state={goals}
        items={[
          {
            id: "chain",
            label: <>Watch the arrival time ride through the agent.</>,
          },
          {
            id: "ghost",
            label: <>Remove the agent and try again.</>,
          },
        ]}
      />
      <Machine
        stageRef={stageRef}
        label="A fact travelling from one server to another through the agent"
        controls={
          <>
            <RectButton onClick={run} disabled={busy} tone="amber">
              book, then invite
            </RectButton>
            <Toggle checked={removed} onChange={setRemoved}>
              remove the agent
            </Toggle>
          </>
        }
        rule={
          <Rule
            show={!!goals.chain || !!goals.ghost}
            pair="flights → calendar"
            ok={!!goals.chain}
            why={goals.chain ? "through the agent" : "no path"}
          />
        }
      >
        <Actor refCb={actor("flights")} kind="server" name="flights" />
        <Actor refCb={actor("agent")} kind="agent" name="agent" ghost={removed} />
        <Actor refCb={actor("calendar")} kind="server" name="calendar" />
      </Machine>
    </>
  );
}
