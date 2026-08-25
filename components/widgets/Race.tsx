"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon, ResetIcon } from "@/components/scene/icons";

type Bar = {
  label: string;
  start: number;
  end: number;
  role: string;
  wait?: boolean;
};

/** Blocking vs task-shaped execution racing on a shared 20-minute clock. */
const BLOCKING: Bar[] = [
  { label: "analyze_repository — connection held open", start: 0, end: 70, role: "danger", wait: true },
  { label: "query CRM (waiting…)", start: 70, end: 78, role: "server" },
  { label: "update project doc (waiting…)", start: 78, end: 88, role: "server" },
  { label: "financial analysis (waiting…)", start: 88, end: 100, role: "task" },
];

const TASKED: Bar[] = [
  { label: "task tk-1: analyze_repository", start: 0, end: 70, role: "task" },
  { label: "query CRM", start: 2, end: 12, role: "server" },
  { label: "update project doc", start: 6, end: 18, role: "server" },
  { label: "task tk-2: financial analysis", start: 4, end: 42, role: "task" },
  { label: "consume tk-1 result → continue", start: 70, end: 82, role: "agent" },
];

const DURATION = 9000;

export function Race() {
  const [p, setP] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  const startRef = useRef(0);
  const baseRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    startRef.current = performance.now();
    baseRef.current = p;
    const frame = (now: number) => {
      const np = Math.min(
        1,
        baseRef.current + (now - startRef.current) / DURATION,
      );
      setP(np);
      if (np < 1) {
        raf.current = requestAnimationFrame(frame);
      } else {
        setPlaying(false);
      }
    };
    raf.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const reset = () => {
    setPlaying(false);
    setP(0);
  };

  const clock = Math.round(p * 20);
  const blockingDone = Math.round(
    Math.min(100, Math.max(0, (p * 100) / 1)) >= 100 ? 4 : p * 100 >= 88 ? 3 : p * 100 >= 78 ? 2 : p * 100 >= 70 ? 1 : 0,
  );
  const taskedDone = TASKED.filter((b) => p * 100 >= b.end).length;

  const lane = (title: string, bars: Bar[], color: string, done: number) => (
    <div className="race-lane" style={{ "--rl": `var(--${color})` } as React.CSSProperties}>
      <h5>
        {title}
        <output>
          {done}/{bars.length} finished
        </output>
      </h5>
      <div className="race-track">
        {bars.map((b) => {
          const local = Math.max(
            0,
            Math.min(1, (p * 100 - b.start) / (b.end - b.start)),
          );
          return (
            <div
              key={b.label}
              className="race-bar"
              data-wait={b.wait && local < 1}
              style={
                {
                  "--rb": `var(--${b.role})`,
                  "--start": `${b.start}%`,
                  "--end": `${b.end}%`,
                  "--p": local,
                } as React.CSSProperties
              }
            >
              <i />
              <b>{b.label}</b>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="race bleed-wide">
      <div
        className="widget-head"
        style={{
          padding: "0.95rem 1.15rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h4><span className="scene-figno" style={{ marginInlineEnd: "0.55rem" }}>Fig. 9</span>The same afternoon, twice</h4>
        <p>
          Top: the long call holds everything hostage. Bottom: the long call
          becomes a task and the agent keeps composing.
        </p>
      </div>
      <div className="race-lanes">
        {lane("One blocking call", BLOCKING, "danger", blockingDone)}
        {lane("Tasks + handles", TASKED, "task", taskedDone)}
      </div>
      <div className="race-controls">
        <button
          type="button"
          className="ctrl ctrl-primary"
          onClick={() => (p >= 1 ? (setP(0), setPlaying(true)) : setPlaying(!playing))}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
          <span>{playing ? "Pause" : p >= 1 ? "Replay" : p > 0 ? "Resume" : "Race"}</span>
        </button>
        <button type="button" className="ctrl" onClick={reset} aria-label="Reset race">
          <ResetIcon />
        </button>
        <span className="race-note" aria-live="polite">
          t = {clock} min of 20
        </span>
      </div>
    </div>
  );
}
