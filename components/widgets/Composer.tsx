"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PlayIcon } from "@/components/scene/icons";

/* ---------------------------------------------------------------------------
   The composer playground: pick capabilities from three servers, order them,
   run the plan, and watch the agent narrate the protocol — handles, pauses,
   tasks, events — in a live trace.
--------------------------------------------------------------------------- */

type Cap = {
  id: string;
  server: string;
  name: string;
  what: string;
  needs?: string[];
  gives?: string;
  givesLabel?: string;
  task?: boolean;
  approval?: boolean;
};

const CAPS: Cap[] = [
  { id: "sf", server: "Flight MCP", name: "search_flights()", what: "find options", gives: "flight", givesLabel: "flight LX39" },
  { id: "bf", server: "Flight MCP", name: "book_flight(flight)", what: "book + ticket", needs: ["flight"], gives: "booking", givesLabel: "booking tkt-88", task: true, approval: true },
  { id: "sh", server: "Hotel MCP", name: "search_hotels()", what: "find options", gives: "hotel", givesLabel: "hotel H-204" },
  { id: "rh", server: "Hotel MCP", name: "reserve(hotel)", what: "hold the room", needs: ["hotel"], gives: "reservation", givesLabel: "res R-51" },
  { id: "ce", server: "Calendar MCP", name: "create_event(booking)", what: "write the trip", needs: ["booking"], gives: "event", givesLabel: "event cal-9" },
  { id: "fs", server: "Calendar MCP", name: "free_slots()", what: "when am I free?", gives: "slots", givesLabel: "slots 3–9 Oct" },
];

const SERVERS = ["Flight MCP", "Hotel MCP", "Calendar MCP"];

const PRESETS: Record<string, string[]> = {
  "the full trip": ["sf", "sh", "bf", "rh", "ce"],
  "flights only": ["sf", "bf"],
  "the broken order": ["ce", "sf"],
};

type TraceRow = {
  actor: string;
  role: "agent" | "server" | "human" | "task" | "event" | "danger";
  html: string;
};

type RunState = {
  rows: TraceRow[];
  handles: { kind: "handle" | "task"; label: string }[];
  running: boolean;
  done: boolean;
};

const EMPTY: RunState = { rows: [], handles: [], running: false, done: false };

export function Composer() {
  const [plan, setPlan] = useState<string[]>(PRESETS["the full trip"]);
  const [run, setRun] = useState<RunState>(EMPTY);
  const timers = useRef<number[]>([]);
  const traceRef = useRef<HTMLDivElement>(null);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clear, []);

  useEffect(() => {
    traceRef.current?.scrollTo({ top: traceRef.current.scrollHeight });
  }, [run.rows.length]);

  const planCaps = useMemo(
    () => plan.map((id) => CAPS.find((c) => c.id === id)!),
    [plan],
  );

  /** Which plan steps are missing a handle they need, given execution order. */
  const blocked = useMemo(() => {
    const have = new Set<string>();
    return planCaps.map((c) => {
      const missing = (c.needs ?? []).filter((n) => !have.has(n));
      if (c.gives) have.add(c.gives);
      return missing;
    });
  }, [planCaps]);

  const addCap = (id: string) => {
    setPlan((p) => [...p, id]);
    setRun(EMPTY);
  };

  const removeAt = (i: number) => {
    setPlan((p) => p.filter((_, j) => j !== i));
    setRun(EMPTY);
  };

  const applyPreset = (ids: string[]) => {
    clear();
    setPlan(ids);
    setRun(EMPTY);
  };

  const execute = () => {
    clear();
    setRun({ ...EMPTY, running: true });
    let t = 150;
    const push = (row: TraceRow, handle?: { kind: "handle" | "task"; label: string }) => {
      timers.current.push(
        window.setTimeout(() => {
          setRun((r) => ({
            ...r,
            rows: [...r.rows, row],
            handles: handle ? [...r.handles, handle] : r.handles,
          }));
        }, t),
      );
    };

    push({ actor: "user", role: "human", html: "<em>intent:</em> plan the Paris trip, check with me before paying" });
    t += 700;
    push({ actor: "agent", role: "agent", html: `plan accepted — <b>${planCaps.length} steps</b>, handles flow between them` });
    t += 750;

    const have = new Set<string>();
    let failed = false;

    for (const cap of planCaps) {
      if (failed) break;
      const missing = (cap.needs ?? []).filter((n) => !have.has(n));

      push({ actor: "agent", role: "agent", html: `tools/call <b>${cap.name}</b> → ${cap.server}` });
      t += 800;

      if (missing.length > 0) {
        push({ actor: cap.server, role: "danger", html: `error: no <b>${missing[0]}</b> handle in this request — nothing on this server remembers a session for you` });
        t += 900;
        push({ actor: "agent", role: "agent", html: `composition bug: <b>${cap.name}</b> ran before anything produced <b>${missing[0]}</b>. Reorder the plan.` });
        failed = true;
        t += 400;
        continue;
      }

      if (cap.approval) {
        push({ actor: cap.server, role: "human", html: `<b>input_required</b> — fare $1,240 · returns <em>requestState</em>, keeps nothing` });
        t += 1000;
        push({ actor: "agent", role: "agent", html: "routes the question to the <b>human</b> (money → person, per intent)" });
        t += 900;
        push({ actor: "user", role: "human", html: "<b>approve</b> — $1,240 is fine" });
        t += 900;
        push({ actor: "agent", role: "agent", html: "resumes call: <em>inputResponses + requestState</em>" });
        t += 800;
      }

      if (cap.task) {
        push(
          { actor: cap.server, role: "task", html: `resultType: <b>"task"</b> · taskId <b>tkt-88</b> — ticketing runs in the background` },
          { kind: "task", label: "task tkt-88" },
        );
        t += 950;
        push({ actor: "agent", role: "agent", html: "files the handle, keeps composing — nothing blocks" });
        t += 800;
        push({ actor: cap.server, role: "event", html: `<b>event:</b> task tkt-88 → completed` });
        t += 900;
      }

      if (cap.gives) {
        have.add(cap.gives);
        push(
          { actor: cap.server, role: "server", html: `result: <b>${cap.givesLabel}</b>` },
          cap.task ? undefined : { kind: "handle", label: cap.givesLabel! },
        );
        t += 850;
      }
    }

    if (!failed) {
      push({ actor: "agent", role: "agent", html: `<b>composition complete</b> — ${planCaps.length} calls, 3 servers, 0 server-to-server integrations` });
      t += 500;
    }

    timers.current.push(
      window.setTimeout(() => {
        setRun((r) => ({ ...r, running: false, done: true }));
      }, t),
    );
  };

  return (
    <div className="builder bleed-wide" id="fig-playground">
      <div className="builder-head">
        <span className="scene-figno" style={{ marginTop: 0 }}>
          Fig. 16
        </span>
        <h4>Compose one yourself</h4>
        <p>
          Build a plan from three servers&rsquo; capabilities, then run it. The
          trace speaks real MCP: handles, <code>input_required</code>, tasks,
          events. Try the broken order, too — the error is the lesson.
        </p>
      </div>

      <div className="builder-grid">
        <div className="builder-col">
          <h5>
            Capabilities <em>— click to add to the plan</em>
          </h5>
          {SERVERS.map((srv) => (
            <div className="server-group" key={srv}>
              <div className="server-group-head">
                <i />
                {srv}
              </div>
              <div className="cap-list">
                {CAPS.filter((c) => c.server === srv).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="cap"
                    onClick={() => addCap(c.id)}
                    disabled={run.running}
                  >
                    <span className="cap-plus" aria-hidden="true">
                      +
                    </span>
                    <span className="cap-name">
                      {c.name}
                      <small>{c.what}</small>
                    </span>
                    <span className="cap-flags">
                      {c.approval ? (
                        <span className="flag" data-kind="approval">
                          approval
                        </span>
                      ) : null}
                      {c.task ? (
                        <span className="flag" data-kind="task">
                          task
                        </span>
                      ) : null}
                      {c.needs?.length ? (
                        <span className="flag" data-kind="needs">
                          needs {c.needs.join(", ")}
                        </span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <h5 style={{ marginTop: "1.1rem" }}>The plan</h5>
          <div className="preset-row">
            {Object.entries(PRESETS).map(([name, ids]) => (
              <button
                key={name}
                type="button"
                className="preset"
                onClick={() => applyPreset(ids)}
                disabled={run.running}
              >
                {name}
              </button>
            ))}
          </div>
          {planCaps.length ? (
            <ol className="plan">
              {planCaps.map((c, i) => (
                <li
                  className="plan-item"
                  key={`${c.id}-${i}`}
                  data-blocked={blocked[i].length > 0}
                >
                  <span className="plan-num">{i + 1}</span>
                  <span className="plan-name">
                    {c.name}
                    {blocked[i].length > 0 ? (
                      <small>
                        needs a {blocked[i][0]} handle no earlier step produces
                      </small>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => removeAt(i)}
                    disabled={run.running}
                    aria-label={`Remove step ${i + 1}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <div className="plan-empty">
              plan is empty — add capabilities from the left
            </div>
          )}

          <div className="builder-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={execute}
              disabled={run.running || planCaps.length === 0}
            >
              <PlayIcon />
              {run.running
                ? "composing…"
                : run.done
                  ? "run it again"
                  : "run the composition"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                clear();
                setPlan([]);
                setRun(EMPTY);
              }}
              disabled={run.running}
            >
              clear
            </button>
          </div>
        </div>

        <div className="builder-col" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
          <h5 style={{ padding: "1rem 1.15rem 0" }}>
            Agent trace <em>— what actually goes over the wire</em>
          </h5>
          <div className="trace" ref={traceRef} aria-live="polite">
            {run.rows.length === 0 ? (
              <span className="handle-empty">
                run the plan and the protocol narrates itself here
              </span>
            ) : (
              run.rows.map((row, i) => (
                <div
                  className="trace-row"
                  key={i}
                  data-role={row.role}
                  data-current={i === run.rows.length - 1 && run.running}
                >
                  <span className="trace-actor">{row.actor}</span>
                  <span
                    className="trace-msg"
                    dangerouslySetInnerHTML={{ __html: row.html }}
                  />
                </div>
              ))
            )}
          </div>
          <div className="state-panel">
            <span>handles the agent carries</span>
            {run.handles.length === 0 ? (
              <span className="handle-empty">none yet</span>
            ) : (
              run.handles.map((h, i) => (
                <span className="handle" key={i} data-kind={h.kind}>
                  <b>{h.kind === "task" ? "⧗" : "◈"}</b>
                  {h.label}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
