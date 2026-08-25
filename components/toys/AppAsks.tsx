"use client";

import { useRef, useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor, Rule } from "@/components/machine/Machine";
import { Goals, type GoalState } from "@/components/machine/Goals";
import { Toggle } from "@/components/machine/buttons";
import { G } from "@/components/ui/Glyph";

/** §4: the app has no connection of its own. It asks the agent. */
export function AppAsks() {
  const { stageRef, actor, fly, deny, pulse, chip, wait } = useStage();
  const [goals, setGoals] = useState<GoalState>({});
  const [allowed, setAllowed] = useState(true);
  const [price, setPrice] = useState(41.2);
  const [bump, setBump] = useState(0);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const errTimer = useRef(0);

  const hit = (id: string) =>
    setGoals((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));

  const refresh = async () => {
    if (busy) return;
    setBusy(true);
    setErr(false);
    await fly({ from: "app", to: "agent", duration: 520 });
    if (allowed) {
      chip("agent", "app-visible ✓", "res");
      await wait(300);
      await fly({ from: "agent", to: "prices" });
      pulse("prices");
      await wait(320);
      await fly({ from: "prices", to: "agent", kind: "res" });
      await fly({ from: "agent", to: "app", kind: "res", duration: 520 });
      setPrice((p) => Math.round((p + (Math.sin(p) + 1.4) * 1.7) * 100) / 100);
      setBump((b) => b + 1);
      hit("refresh");
    } else {
      chip("agent", "app-visible ✕", "deny");
      pulse("agent", "deny-shake");
      await deny({ from: "agent", to: "app", until: 0.999, duration: 480 });
      window.clearTimeout(errTimer.current);
      setErr(true);
      errTimer.current = window.setTimeout(() => setErr(false), 1600);
      hit("denied");
    }
    setBusy(false);
  };

  return (
    <>
      <Goals
        state={goals}
        items={[
          {
            id: "refresh",
            label: (
              <>
                Refresh prices from inside the <G k="app">app</G>.
              </>
            ),
          },
          {
            id: "denied",
            label: <>Turn the permission off and try again.</>,
          },
        ]}
      />
      <Machine
        stageRef={stageRef}
        label="An app asking the agent to call its own server"
        minHeight={168}
        controls={
          <Toggle checked={allowed} onChange={setAllowed}>
            app may call <code>refresh_prices</code>
          </Toggle>
        }
        rule={
          <Rule
            show={!!goals.refresh || !!goals.denied}
            pair="app → server"
            ok={false}
            why="asks the agent instead"
          />
        }
        caption="the button lives inside the app. the request still goes the long way round"
      >
        <div className="act">
          <div className="appwin" ref={actor("app") as React.Ref<HTMLDivElement>}>
            <div className="appwin-bar" aria-hidden="true">
              <i />
              <i />
              <span>price-ticker</span>
            </div>
            <div className="appwin-body">
              <span key={bump} className={bump ? "price bump" : "price"}>
                ${price.toFixed(2)}
              </span>
              <button type="button" className="mini-btn" onClick={refresh}>
                refresh ↻
              </button>
              <span className="app-err" aria-live="polite">
                {err ? "denied by host" : " "}
              </span>
            </div>
          </div>
          <span className="alabel">app · sandboxed</span>
        </div>
        <Actor refCb={actor("agent")} kind="agent" name="agent · host" />
        <Actor refCb={actor("prices")} kind="server" name="prices" />
      </Machine>
    </>
  );
}
