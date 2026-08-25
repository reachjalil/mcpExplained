"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { RectButton } from "@/components/machine/buttons";

const TEMPLATES: Record<string, { hole: string; filled: string }> = {
  summarize: {
    hole: "Summarize ____ in three bullets.",
    filled: 'Summarize report.md in three bullets.',
  },
  translate: {
    hole: "Translate ____ to French.",
    filled: "Translate report.md to French.",
  },
};

/** The slot is the concept: a prompt is a template with holes, and
 *  prompts/get is the server filling them into a ready message. */
export function PromptsDemo() {
  const { stageRef, actor, fly, pulse, wait } = useStage();
  const [picked, setPicked] = useState<string | null>(null);
  const [filled, setFilled] = useState(false);
  const [busy, setBusy] = useState(false);

  const pick = async (name: string) => {
    if (busy) return;
    setBusy(true);
    setPicked(name);
    setFilled(false);
    await fly({ from: "agent", to: "server", tag: "prompts/get" });
    pulse("server");
    await wait(320);
    await fly({ from: "server", to: "agent", kind: "res", tag: "messages" });
    pulse("agent");
    setFilled(true);
    setBusy(false);
  };

  return (
    <Machine
      stageRef={stageRef}
      label="A template, filled"
      minHeight={150}
      controls={
        <>
          <RectButton onClick={() => pick("summarize")} disabled={busy} tone="amber">
            /summarize
          </RectButton>
          <RectButton onClick={() => pick("translate")} disabled={busy}>
            /translate
          </RectButton>
        </>
      }
      rule={
        <div className="mnote" data-show={picked !== null}>
          <div className="mnote-inner">
            <span className="mnote-k">{filled ? "ready to send" : "template"}</span>
            <span key={`${picked}-${filled}`} className="mnote-v">
              {picked ? (filled ? TEMPLATES[picked].filled : TEMPLATES[picked].hole) : ""}
            </span>
          </div>
        </div>
      }
      caption="you picked it, the server filled the hole. the model was never asked"
    >
      <Actor refCb={actor("agent")} kind="agent" name="host" />
      <Actor refCb={actor("server")} kind="server" name="notes" />
    </Machine>
  );
}
