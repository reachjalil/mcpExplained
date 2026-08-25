"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "@/components/scene/icons";

const STAGES = [
  { id: "authz", label: "authorization", sub: "is this agent allowed to touch this object?" },
  { id: "policy", label: "policy", sub: "does this operation fit the rules of the domain?" },
  { id: "approval", label: "human approval", sub: "side effects above a threshold get a person" },
  { id: "idem", label: "idempotency", sub: "has this exact mutation already run?" },
  { id: "version", label: "concurrency check", sub: "is the object still the one the agent saw?" },
  { id: "mutate", label: "mutation", sub: "only now does anything change" },
];

type RunKind = "pass" | "block";

/**
 * The deterministic gauntlet between "the model decided" and "the system
 * changed". One run passes; one gets stopped at policy.
 */
export function Guardrail() {
  const [states, setStates] = useState<Record<string, string>>({});
  const [flowing, setFlowing] = useState<number>(-1);
  const [verdict, setVerdict] = useState<RunKind | null>(null);
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => clear, []);

  const run = (kind: RunKind) => {
    clear();
    setStates({});
    setVerdict(null);
    setFlowing(-1);
    setRunning(true);
    const blockAt = kind === "block" ? "policy" : null;
    // Only schedule up to (and including) the blocking stage — the gauntlet
    // genuinely stops there, so nothing later may fire.
    const blockIdx = blockAt
      ? STAGES.findIndex((stage) => stage.id === blockAt)
      : -1;
    const gauntlet = blockIdx >= 0 ? STAGES.slice(0, blockIdx + 1) : STAGES;
    let t = 200;
    gauntlet.forEach((stage, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setFlowing(i - 1);
          setStates((s) => ({ ...s, [stage.id]: "active" }));
        }, t),
      );
      t += 560;
      const outcome = stage.id === blockAt ? "block" : "pass";
      timers.current.push(
        window.setTimeout(() => {
          setStates((s) => ({ ...s, [stage.id]: outcome }));
          if (outcome === "block") {
            setRunning(false);
            setVerdict("block");
          } else if (i === gauntlet.length - 1) {
            setRunning(false);
            setVerdict("pass");
          }
        }, t),
      );
      t += 90;
    });
  };


  return (
    <div className="guardrail bleed-wide">
      <div
        className="widget-head"
        style={{
          padding: "0.95rem 1.15rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h4><span className="scene-figno" style={{ marginInlineEnd: "0.55rem" }}>Fig. 14</span>“The agent decided” is the beginning, not the end</h4>
        <p>
          Send a mutation through the gauntlet. The agent chose <em>what</em>{" "}
          happens next; these deterministic layers still decide <em>whether</em>.
        </p>
      </div>
      <div className="guardrail-stage" aria-live="polite">
        <div className="gr-node" data-state={running || verdict ? "pass" : "idle"}>
          <span className="gr-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16"><path d="M8 2v7M4.5 6 8 9.5 11.5 6M3 13h10" /></svg>
          </span>
          <b>agent decision</b>
          <small>“move this customer to the enterprise plan”</small>
        </div>
        {STAGES.map((stage, i) => (
          <span key={stage.id} style={{ display: "contents" }}>
            <span className="gr-pipe" data-flow={flowing >= i - 1 && !!states[stage.id]} aria-hidden="true" />
            <div className="gr-node" data-state={states[stage.id] ?? "idle"}>
              <span className="gr-icon" aria-hidden="true">
                {states[stage.id] === "pass" ? (
                  <svg viewBox="0 0 16 16"><path d="m3 8.5 3.5 3.5L13 5" /></svg>
                ) : states[stage.id] === "block" ? (
                  <svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                ) : (
                  <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" /></svg>
                )}
              </span>
              <b>{stage.label}</b>
              <small>{stage.sub}</small>
            </div>
          </span>
        ))}
      </div>
      <div className="guardrail-controls">
        <button
          type="button"
          className="ctrl ctrl-primary"
          onClick={() => run("pass")}
          disabled={running}
        >
          <PlayIcon />
          <span>Clean run</span>
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => run("block")}
          disabled={running}
        >
          Run one that should be stopped
        </button>
        {verdict ? (
          <span className="guardrail-verdict" data-kind={verdict}>
            {verdict === "pass"
              ? "mutation applied — every gate agreed"
              : "stopped at policy — the model's confidence changed nothing"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
