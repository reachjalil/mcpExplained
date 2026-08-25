"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor, Wall, Rule } from "@/components/machine/Machine";
import { Goals, type GoalState } from "@/components/machine/Goals";
import { RectButton } from "@/components/machine/buttons";
import { G } from "@/components/ui/Glyph";

/** §2: there is no wire between servers. Not a slow one. None. */
export function ServerWall() {
  const { stageRef, actor, deny, pulse } = useStage();
  const [goals, setGoals] = useState<GoalState>({});
  const [busy, setBusy] = useState(false);

  const attempt = async () => {
    if (busy) return;
    setBusy(true);
    pulse("flights");
    await deny({ from: "flights", to: "calendar", until: 0.52 });
    setGoals((s) => ({
      ...s,
      blocked: (s.blocked ?? 0) + 1,
      again: (s.again ?? 0) + 1,
    }));
    setBusy(false);
  };

  return (
    <>
      <Goals
        state={goals}
        items={[
          {
            id: "blocked",
            label: (
              <>
                Watch a server-to-server call get <G k="blocked">blocked</G>.
              </>
            ),
          },
          {
            id: "again",
            target: 2,
            label: <>Try again anyway.</>,
          },
        ]}
      />
      <Machine
        stageRef={stageRef}
        label="Two servers with no connection between them"
        controls={
          <RectButton onClick={attempt} disabled={busy}>
            make flights call calendar
          </RectButton>
        }
        rule={
          <Rule
            show={!!goals.blocked}
            pair="server → server"
            ok={false}
            why="strangers by design"
          />
        }
      >
        <Actor refCb={actor("flights")} kind="server" name="flights" />
        <Wall label="no wire" />
        <Actor refCb={actor("calendar")} kind="server" name="calendar" />
      </Machine>
    </>
  );
}
