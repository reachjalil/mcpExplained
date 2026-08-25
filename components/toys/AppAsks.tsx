"use client";

import { useRef, useState } from "react";
import { useStage } from "@/components/machine/stage";
import { Machine, Actor, Rule } from "@/components/machine/Machine";
import { Goals, type GoalState } from "@/components/machine/Goals";
import { Toggle } from "@/components/machine/buttons";
import { G } from "@/components/ui/Glyph";

/**
 * §4: the app has no connection of its own. It asks the agent, and when the
 * answer comes back the host writes it into the model's context first. The
 * note under the board updates before the app's display does, on purpose.
 */
export function AppAsks() {
  const { stageRef, actor, fly, deny, pulse, chip, wait } = useStage();
  const [goals, setGoals] = useState<GoalState>({});
  const [allowed, setAllowed] = useState(true);
  const [price, setPrice] = useState(41.2);
  const [seen, setSeen] = useState<number | null>(null);
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
      const next =
        Math.round((price + (Math.sin(price) + 1.4) * 1.7) * 100) / 100;
      chip("agent", "app-visible ✓", "res");
      await wait(300);
      await fly({ from: "agent", to: "prices" });
      pulse("prices");
      await wait(320);
      await fly({ from: "prices", to: "agent", kind: "res" });
      // The host records the result before the app ever sees it.
      setSeen(next);
      await fly({ from: "agent", to: "app", kind: "res", duration: 520 });
      pulse("app");
      setPrice(next);
      setBump((b) => b + 1);
      hit("refresh");
      hit("ctx");
    } else {
      chip("agent", "app-visible ✕", "deny");
      pulse("agent", "deny-shake");
      await deny({ from: "agent", to: "app", until: 0.999, duration: 480 });
      pulse("app", "deny-shake");
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
            id: "ctx",
            target: 2,
            label: <>Refresh twice and watch what the model knows change.</>,
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
          <>
            <Rule
              show={!!goals.refresh || !!goals.denied}
              pair="app → server"
              ok={false}
              why="asks the agent instead"
            />
            <div className="mnote" data-show={seen !== null}>
              <div className="mnote-inner">
                <span className="mnote-k">the model now knows</span>
                <span
                  key={seen ?? 0}
                  className="mnote-v"
                  aria-live="polite"
                >
                  {seen !== null ? `price-ticker: $${seen.toFixed(2)}` : ""}
                </span>
              </div>
            </div>
          </>
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
                {err ? "denied by host" : " "}
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
