"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useStage } from "@/components/machine/stage";
import { Actor } from "@/components/machine/Machine";
import { Overture, type SyllabusItem } from "@/components/machine/Overture";
import { ShapeButton } from "@/components/machine/buttons";

type Phase = "enter" | "mesh" | "cut" | "ready" | "played";

const SYLLABUS: SyllabusItem[] = [
  { n: "01", title: "One connection", hint: "the only wire at the start", href: "#s-01" },
  { n: "02", title: "Servers are strangers", hint: "no line between them", href: "#s-02" },
  { n: "03", title: "Facts travel through the middle", hint: "the agent carries them", href: "#s-03" },
  { n: "04", title: "Apps have to ask", hint: "sandboxed, no keys", href: "#s-04" },
  { n: "05", title: "You are a boundary too", hint: "side effects wait", href: "#s-05" },
];

const WIRES: { a: string; b: string; role: "live" | "dead"; path?: boolean }[] = [
  { a: "you", b: "agent", role: "live", path: true },
  { a: "agent", b: "weather", role: "live", path: true },
  { a: "agent", b: "calendar", role: "live" },
  { a: "agent", b: "app", role: "live" },
  { a: "weather", b: "calendar", role: "dead" },
  { a: "you", b: "weather", role: "dead" },
  { a: "you", b: "calendar", role: "dead" },
  { a: "you", b: "app", role: "dead" },
  { a: "app", b: "weather", role: "dead" },
  { a: "app", b: "calendar", role: "dead" },
];

const PROMPT: Record<Phase, string> = {
  enter: "Four characters. Watch the board fill in.",
  mesh: "Every line looks possible.",
  cut: "Almost none of them exist.",
  ready: "Click you. Send a request down the wire that remains.",
  played: "Five machines below. You'll be doing the clicking.",
};

/**
 * Opening board for “Who can talk to whom?”: a naive mesh collapses to the
 * agent hub, one blocked hop plays as a trailer, then the reader clicks.
 */
export function TalkOverture() {
  const { stageRef, actor, fly, deny, pulse, chip, wait } = useStage();
  const [phase, setPhase] = useState<Phase>("enter");
  const [busy, setBusy] = useState(false);
  const skipIntro = useRef(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const t = window.setTimeout(() => setPhase("ready"), 0);
      return () => window.clearTimeout(t);
    }
    const t1 = window.setTimeout(() => {
      if (!skipIntro.current) setPhase("mesh");
    }, 640);
    const t2 = window.setTimeout(() => {
      if (!skipIntro.current) setPhase("cut");
    }, 1680);
    const t3 = window.setTimeout(() => {
      if (!skipIntro.current) setPhase("ready");
    }, 2880);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (phase !== "cut" || skipIntro.current) return;
    deny({ from: "weather", to: "calendar", until: 0.52, duration: 560 });
  }, [phase, deny]);

  const send = async () => {
    if (busy) return;
    skipIntro.current = true;
    setBusy(true);
    setPhase((p) => (p === "played" ? p : "ready"));
    await fly({ from: "you", to: "agent", duration: 520 });
    pulse("agent");
    await wait(180);
    pulse("weather");
    await wait(140);
    pulse("calendar");
    await wait(140);
    pulse("app");
    chip("agent", "holds every connection", "res");
    setPhase("played");
    setBusy(false);
  };

  return (
    <Overture
      stageRef={stageRef}
      label="the question"
      phase={phase}
      prompt={PROMPT[phase]}
      syllabus={SYLLABUS}
      showSyllabus={phase === "played"}
      minHeight={288}
    >
      <ShapeButton
        className="ov-you"
        refCb={actor("you")}
        onClick={send}
        hint={phase === "ready"}
        label="Hand your request to the agent"
      />
      <Actor
        className="ov-agent"
        refCb={actor("agent")}
        kind="agent"
        name="agent"
      />
      <Actor
        className="ov-weather"
        refCb={actor("weather")}
        kind="server"
        name="weather"
      />
      <Actor
        className="ov-calendar"
        refCb={actor("calendar")}
        kind="server"
        name="calendar"
      />
      <div className="act ov-app">
        <span className="ashape as-app" ref={actor("app")} />
        <span className="alabel">app</span>
      </div>
      <WireLayer stageRef={stageRef} phase={phase} />
    </Overture>
  );
}

function WireLayer({
  stageRef,
  phase,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  phase: Phase;
}) {
  const [pts, setPts] = useState<Record<string, { x: number; y: number }>>({});
  const [box, setBox] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const s = stage.getBoundingClientRect();
    const next: Record<string, { x: number; y: number }> = {};
    stage.querySelectorAll<HTMLElement>("[data-actor]").forEach((el) => {
      const name = el.dataset.actor;
      if (!name) return;
      const r = el.getBoundingClientRect();
      next[name] = {
        x: r.left + r.width / 2 - s.left,
        y: r.top + r.height / 2 - s.top,
      };
    });
    setPts(next);
    setBox({ w: s.width, h: s.height });
  }, [stageRef]);

  useLayoutEffect(() => {
    measure();
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [measure, phase, stageRef]);

  const cut = pts.weather && pts.calendar
    ? {
        x: (pts.weather.x + pts.calendar.x) / 2,
        y: (pts.weather.y + pts.calendar.y) / 2,
      }
    : null;

  return (
    <svg
      className="owires"
      viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {WIRES.map((w) => {
        const a = pts[w.a];
        const b = pts[w.b];
        if (!a || !b) return null;
        return (
          <line
            key={`${w.a}-${w.b}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className={[
              "owire",
              `owire-${w.role}`,
              w.path ? "owire-path" : "",
              `is-${phase}`,
            ].join(" ")}
          />
        );
      })}
      {cut && phase !== "enter" && phase !== "mesh" ? (
        <text className={`owire-x is-${phase}`} x={cut.x} y={cut.y}>
          ✕
        </text>
      ) : null}
    </svg>
  );
}
