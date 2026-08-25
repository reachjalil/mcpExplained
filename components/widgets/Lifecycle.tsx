"use client";

import { useState } from "react";

type StateId = "working" | "input_required" | "completed" | "failed" | "cancelled";

const TRANSITIONS: Record<string, { to: StateId; label: string; note: string }[]> = {
  working: [
    { to: "input_required", label: "needs input", note: "The task hit a decision it cannot make alone. It parks — nothing is blocked, nothing times out." },
    { to: "completed", label: "finishes", note: "Terminal. The result waits for the agent to collect it — the task outlives the request that started it." },
    { to: "failed", label: "errors", note: "Terminal. Failure is a state you can read, not a dropped connection you have to infer." },
    { to: "cancelled", label: "tasks/cancel", note: "Terminal. Cancellation is an API call on the object — not killing a connection and hoping." },
  ],
  input_required: [
    { to: "working", label: "input arrives", note: "The agent routed the question (human, model, or policy) and replayed the answer. Work resumes." },
    { to: "cancelled", label: "tasks/cancel", note: "A parked task can be abandoned cleanly — the object records it." },
  ],
  completed: [],
  failed: [],
  cancelled: [],
};

const TERMINAL: StateId[] = ["completed", "failed", "cancelled"];
const ALL: StateId[] = ["working", "input_required", "completed", "failed", "cancelled"];
const COLOR: Record<StateId, string> = {
  working: "task",
  input_required: "human",
  completed: "task",
  failed: "danger",
  cancelled: "neutral",
};

/** SEP-2663's task state machine, drivable by hand. */
export function Lifecycle() {
  const [state, setState] = useState<StateId>("working");
  const [visited, setVisited] = useState<StateId[]>(["working"]);
  const [note, setNote] = useState(
    "A task is born working. Drive it: every button below is a legal transition from the current state.",
  );
  const [noteKey, setNoteKey] = useState(0);

  const options = TRANSITIONS[state];

  const move = (to: StateId, transitionNote: string) => {
    setState(to);
    setVisited((v) => (v.includes(to) ? v : [...v, to]));
    setNote(transitionNote);
    setNoteKey((k) => k + 1);
  };

  const reset = () => {
    setState("working");
    setVisited(["working"]);
    setNote("Reset. The task is working again — pick its fate.");
    setNoteKey((k) => k + 1);
  };

  return (
    <div className="lifecycle bleed-wide">
      <div
        className="widget-head"
        style={{
          padding: "0.95rem 1.15rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h4><span className="scene-figno" style={{ marginInlineEnd: "0.55rem" }}>Fig. 8</span>The task state machine, in your hands</h4>
        <p>SEP-2663 defines tasks as durable state machines. Drive this one.</p>
      </div>
      <div className="lifecycle-stage">
        <div className="lifecycle-row" role="group" aria-label="Task states">
          {ALL.map((s, i) => (
            <span key={s} style={{ display: "contents" }}>
              {i > 0 ? (
                <span className="lc-arrow" data-hot={state === s} aria-hidden="true">
                  →
                </span>
              ) : null}
              <button
                type="button"
                className="lc-state"
                data-live={state === s}
                data-visited={visited.includes(s)}
                data-terminal={TERMINAL.includes(s)}
                style={
                  {
                    "--lc": `var(--${COLOR[s] === "neutral" ? "text-faint" : COLOR[s]})`,
                  } as React.CSSProperties
                }
                onClick={() => {
                  const t = TRANSITIONS[state].find((x) => x.to === s);
                  if (t) move(s, t.note);
                }}
                disabled={!TRANSITIONS[state].some((x) => x.to === s)}
                aria-pressed={state === s}
              >
                {s}
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="lifecycle-log" aria-live="polite">
        <span key={noteKey} className="narration-swap">
          <b>{state}</b> — {note}
        </span>
      </div>
      <div className="lifecycle-controls">
        {options.length > 0 ? (
          options.map((t) => (
            <button
              key={t.to}
              type="button"
              className="lc-btn"
              onClick={() => move(t.to, t.note)}
            >
              {t.label} → {t.to}
            </button>
          ))
        ) : (
          <button type="button" className="lc-btn" onClick={reset}>
            terminal state — start a new task
          </button>
        )}
      </div>
    </div>
  );
}
