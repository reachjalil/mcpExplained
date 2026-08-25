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

  return (
    <Machine
      stageRef={stageRef}
      label="The server's visible world"
      minHeight={150}
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
      caption="every flip is a list_changed notification. the server was never asked for consent"
    >
      <Actor refCb={actor("agent")} kind="agent" name="host" />
      <div className="acol">
        <Actor refCb={actor("server")} kind="server" name="files" />
        <div className="cappills" aria-live="polite">
          <span className="doccard" data-ghost={!projects}>
            {projects ? "~/projects" : "~/projects ✕"}
          </span>
          <span className="doccard" data-ghost={!finance}>
            {finance ? "~/finance" : "~/finance ✕"}
          </span>
        </div>
      </div>
    </Machine>
  );
}
