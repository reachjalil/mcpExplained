"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { RectButton } from "@/components/machine/buttons";

/** elicitation: the server asks you a question, through the host's UI. */
export function ElicitationDemo() {
  const { stageRef, actor, fly, pulse, chip } = useStage();
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ask = async () => {
    if (busy || asking) return;
    setBusy(true);
    await fly({ from: "server", to: "agent", tag: "elicit" });
    pulse("agent");
    setAsking(true);
    setBusy(false);
  };

  const pick = async (flight: string) => {
    setAsking(false);
    setBusy(true);
    chip("agent", `you picked ${flight}`, "ink");
    await fly({ from: "agent", to: "server", kind: "res", tag: flight });
    pulse("server");
    setAnswer(`server got: ${flight}. it asked a question, not for your screen`);
    setBusy(false);
  };

  return (
    <Machine
      stageRef={stageRef}
      label="A question travelling upstream"
      controls={
        <>
          <RectButton onClick={ask} disabled={busy || asking} tone="amber">
            server needs a decision
          </RectButton>
          <div className="drawer" data-open={asking} style={{ flexBasis: "100%" }}>
            <div>
              <div className="drawer-inner">
                <span className="dq">two flights match. which did you mean?</span>
                <span className="dbtns gchoices">
                  <RectButton onClick={() => pick("LX · 14:05")}>
                    LX · 14:05
                  </RectButton>
                  <RectButton onClick={() => pick("BA · 16:20")}>
                    BA · 16:20
                  </RectButton>
                </span>
              </div>
            </div>
          </div>
        </>
      }
      rule={
        <div className="mnote" data-show={answer !== null}>
          <div className="mnote-inner">
            <span className="mnote-k">delivered</span>
            <span key={answer ?? ""} className="mnote-v">
              {answer}
            </span>
          </div>
        </div>
      }
      caption="the buttons you just used are the host's UI, not the server's. the server only ever sees the answer"
    >
      <Actor refCb={actor("agent")} kind="agent" name="host · your UI" />
      <Actor refCb={actor("server")} kind="server" name="flights" />
    </Machine>
  );
}
