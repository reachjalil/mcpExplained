"use client";

import { useRef, useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor } from "@/components/machine/Machine";
import { Toggle } from "@/components/machine/buttons";

/** roots: the host tells the server where it may look. Flip a folder and
 *  watch the server's world change size. */
export function RootsDemo() {
  const { stageRef, actor, fly, pulse } = useStage();
  const [projects, setProjects] = useState(true);
  const [finance, setFinance] = useState(false);
  const queue = useRef(Promise.resolve());

  const announce = () => {
    // serialize flights so rapid toggling stays readable
    queue.current = queue.current.then(async () => {
      await fly({ from: "agent", to: "server", tag: "roots changed" });
      pulse("server");
    });
  };

  const visible = [projects ? "~/projects" : null, finance ? "~/finance" : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Machine
      stageRef={stageRef}
      label="The server's visible world"
      controls={
        <>
          <Toggle
            checked={projects}
            onChange={(v) => {
              setProjects(v);
              announce();
            }}
          >
            root: <code>~/projects</code>
          </Toggle>
          <Toggle
            checked={finance}
            onChange={(v) => {
              setFinance(v);
              announce();
            }}
          >
            root: <code>~/finance</code>
          </Toggle>
        </>
      }
      rule={
        <div className="mnote" data-show={true}>
          <div className="mnote-inner">
            <span className="mnote-k">server can see</span>
            <span key={visible || "nothing"} className="mnote-v">
              {visible || "nothing at all"}
            </span>
          </div>
        </div>
      }
      caption="notifications/roots/list_changed goes out on every flip. the server adjusts; it was never asked for consent"
    >
      <Actor refCb={actor("agent")} kind="agent" name="host" />
      <Actor refCb={actor("server")} kind="server" name="files" />
    </Machine>
  );
}
