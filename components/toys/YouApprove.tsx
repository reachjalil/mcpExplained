"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor, Rule } from "@/components/machine/Machine";
import { Goals, type GoalState } from "@/components/machine/Goals";
import { RectButton } from "@/components/machine/buttons";

/** §5: the reader is the boundary. Approve or deny the side effect. */
export function YouApprove() {
  const { stageRef, actor, fly, pulse, chip, wait } = useStage();
  const [goals, setGoals] = useState<GoalState>({});
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);

  const hit = (id: string) =>
    setGoals((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));

  const start = async () => {
    if (busy || pending) return;
    setBusy(true);
    pulse("agent");
    chip("agent", "needs your ok", "ink");
    await wait(420);
    setPending(true);
    setBusy(false);
  };

  const approve = async () => {
    setPending(false);
    setBusy(true);
    await fly({ from: "agent", to: "payments" });
    pulse("payments");
    await wait(360);
    await fly({ from: "payments", to: "agent", kind: "res", tag: "booked" });
    chip("agent", "booked ✓", "res");
    hit("ok");
    setBusy(false);
  };

  const denyIt = async () => {
    setPending(false);
    chip("agent", "cancelled, nothing crossed", "deny");
    pulse("agent", "deny-shake");
    hit("no");
  };

  return (
    <>
      <Goals
        state={goals}
        items={[
          { id: "ok", label: <>Approve a payment.</> },
          { id: "no", label: <>Deny one, and notice that nothing happened.</> },
        ]}
      />
      <Machine
        stageRef={stageRef}
        label="A payment waiting for your approval"
        controls={
          <>
            <RectButton onClick={start} disabled={busy || pending} tone="amber">
              book the flight · $240
            </RectButton>
            <div className="drawer" data-open={pending} style={{ flexBasis: "100%" }}>
              <div>
                <div className="drawer-inner">
                  <span className="dq">agent wants to charge $240. allow it?</span>
                  <span className="dbtns">
                    <RectButton onClick={approve}>approve</RectButton>
                    <RectButton onClick={denyIt} tone="red">
                      deny
                    </RectButton>
                  </span>
                </div>
              </div>
            </div>
          </>
        }
        rule={
          <Rule
            show={!!goals.ok || !!goals.no}
            pair="agent → your money"
            ok={!!goals.ok}
            why={goals.ok ? "you said yes" : "nothing crossed"}
          />
        }
      >
        <Actor refCb={actor("agent")} kind="agent" name="agent" />
        <Actor refCb={actor("payments")} kind="server" name="payments" />
      </Machine>
    </>
  );
}
