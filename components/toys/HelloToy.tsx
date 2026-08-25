"use client";

import { useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor, Rule } from "@/components/machine/Machine";
import { ShapeButton } from "@/components/machine/buttons";

/** The landing page's one delight: a button, a server, and the whole idea. */
export function HelloToy() {
  const { stageRef, actor, fly, pulse, chip, wait } = useStage();
  const [clicks, setClicks] = useState(0);
  const [landed, setLanded] = useState(false);

  const go = async () => {
    setClicks((c) => c + 1);
    await fly({ from: "you", to: "server" });
    pulse("server");
    await wait(300);
    await fly({ from: "server", to: "you", kind: "res" });
    setLanded(true);
    if (clicks === 0) chip("you", "that's the whole idea", "res");
    if (clicks === 4) chip("you", "ok, go read the article", "ink");
  };

  return (
    <div className="hello-toy">
      <Machine
        stageRef={stageRef}
        label="Click the button, get an answer back"
        minHeight={120}
        rule={
          <Rule
            show={landed}
            pair="you → a server"
            ok
            why="that's the whole idea"
          />
        }
      >
        <ShapeButton refCb={actor("you")} onClick={go} hint={clicks === 0} label="Send a request" />
        <Actor refCb={actor("server")} kind="server" name="a server" />
      </Machine>
    </div>
  );
}
