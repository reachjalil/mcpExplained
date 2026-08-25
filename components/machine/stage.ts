"use client";

import { useCallback, useRef } from "react";

type Pt = { x: number; y: number };

export type FlyOpts = {
  from: string;
  to: string;
  /** amber request (default) or teal result */
  kind?: "req" | "res";
  /** small mono tag pinned to the dot, e.g. "14:05" */
  tag?: string;
  duration?: number;
  /** stop at this fraction of the path — used for blocked calls */
  until?: number;
};

/**
 * The animation heart of every machine. Actors register DOM nodes by name;
 * `fly` spawns a dot and moves it between actor centres with WAAPI, resolving
 * when it lands, so choreography reads as plain async code:
 *
 *   await fly({ from: "app", to: "agent" });
 *   chip("agent", "app-visible ✓", "res");
 *   await fly({ from: "agent", to: "server" });
 */
export function useStage() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const actors = useRef(new Map<string, HTMLElement>());

  const actor = useCallback(
    (name: string) => (el: HTMLElement | null) => {
      if (el) actors.current.set(name, el);
      else actors.current.delete(name);
    },
    [],
  );

  const centerOf = useCallback((name: string): Pt => {
    const stage = stageRef.current;
    const el = actors.current.get(name);
    if (!stage || !el) return { x: 0, y: 0 };
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - s.left,
      y: r.top + r.height / 2 - s.top,
    };
  }, []);

  const reduced = () =>
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const fly = useCallback(
    async ({ from, to, kind = "req", tag, duration = 620, until = 1 }: FlyOpts) => {
      const stage = stageRef.current;
      if (!stage) return;
      const a = centerOf(from);
      const b = centerOf(to);
      const end = { x: a.x + (b.x - a.x) * until, y: a.y + (b.y - a.y) * until };

      const dot = document.createElement("span");
      dot.className = `fdot${kind === "res" ? " fdot-res" : ""}`;
      if (tag) dot.dataset.tag = tag;
      stage.appendChild(dot);

      const dur = reduced() ? 60 : duration * until;
      const anim = dot.animate(
        [
          {
            transform: `translate(${a.x}px, ${a.y}px) translate(-50%, -50%) scale(0.3)`,
            opacity: 0,
          },
          {
            transform: `translate(${a.x}px, ${a.y}px) translate(-50%, -50%) scale(1)`,
            opacity: 1,
            offset: 0.15,
          },
          {
            transform: `translate(${end.x}px, ${end.y}px) translate(-50%, -50%) scale(1)`,
            opacity: 1,
          },
        ],
        { duration: dur, easing: "cubic-bezier(.35,.75,.25,1)", fill: "forwards" },
      );
      await anim.finished.catch(() => {});

      // Landed: shrink into the destination (or hang at the wall for a beat).
      const out = dot.animate(
        [
          { transform: `translate(${end.x}px, ${end.y}px) translate(-50%, -50%) scale(1)`, opacity: 1 },
          { transform: `translate(${end.x}px, ${end.y}px) translate(-50%, -50%) scale(0.4)`, opacity: 0 },
        ],
        { duration: reduced() ? 40 : 200, easing: "ease-in", fill: "forwards" },
      );
      await out.finished.catch(() => {});
      dot.remove();
      return end;
    },
    [centerOf],
  );

  /** A call that hits a boundary: travels partway, ✕ pops, the dot falls. */
  const deny = useCallback(
    async ({ from, to, until = 0.5, duration = 620 }: FlyOpts) => {
      const stage = stageRef.current;
      if (!stage) return;
      const a = centerOf(from);
      const b = centerOf(to);
      const end = { x: a.x + (b.x - a.x) * until, y: a.y + (b.y - a.y) * until };

      const dot = document.createElement("span");
      dot.className = "fdot";
      stage.appendChild(dot);

      const slow = reduced();
      const anim = dot.animate(
        [
          { transform: `translate(${a.x}px, ${a.y}px) translate(-50%, -50%) scale(0.3)`, opacity: 0 },
          { transform: `translate(${a.x}px, ${a.y}px) translate(-50%, -50%) scale(1)`, opacity: 1, offset: 0.15 },
          { transform: `translate(${end.x}px, ${end.y}px) translate(-50%, -50%) scale(1)`, opacity: 1 },
        ],
        { duration: slow ? 60 : duration * until, easing: "cubic-bezier(.4,.6,.5,1)", fill: "forwards" },
      );
      await anim.finished.catch(() => {});

      // ✕ pops at the boundary…
      const x = document.createElement("span");
      x.className = "popx";
      x.textContent = "✕";
      x.style.left = `${end.x}px`;
      x.style.top = `${end.y - 24}px`;
      stage.appendChild(x);
      window.setTimeout(() => x.remove(), 950);

      // …and the dot bounces back a little, then drops.
      const back = Math.sign(a.x - b.x) * 42;
      const fall = dot.animate(
        [
          { transform: `translate(${end.x}px, ${end.y}px) translate(-50%, -50%) scale(1)`, opacity: 1 },
          {
            transform: `translate(${end.x + back}px, ${end.y + 8}px) translate(-50%, -50%) scale(0.9)`,
            opacity: 1,
            offset: 0.45,
          },
          {
            transform: `translate(${end.x + back * 1.3}px, ${end.y + 44}px) translate(-50%, -50%) scale(0.7)`,
            opacity: 0,
          },
        ],
        { duration: slow ? 40 : 520, easing: "cubic-bezier(.3,.6,.6,1)", fill: "forwards" },
      );
      await fall.finished.catch(() => {});
      dot.remove();
    },
    [centerOf],
  );

  /** Quick scale pulse on an actor (processing / acknowledging). */
  const pulse = useCallback((name: string, cls: "pulse" | "deny-shake" = "pulse") => {
    const el = actors.current.get(name);
    if (!el) return;
    const host = el.closest(".act") ?? el;
    host.classList.remove(cls);
    // restart the animation if it's already running
    void (host as HTMLElement).offsetWidth;
    host.classList.add(cls);
    window.setTimeout(() => host.classList.remove(cls), 600);
  }, []);

  /** Transient mono chip above an actor: chip("agent", "app-visible ✓", "res"). */
  const chip = useCallback(
    (name: string, text: string, tone: "res" | "deny" | "ink" = "ink", dy = -44) => {
      const stage = stageRef.current;
      if (!stage) return;
      const p = centerOf(name);
      const el = document.createElement("span");
      el.className = "mchip";
      el.dataset.tone = tone;
      el.textContent = text;
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y + dy}px`;
      stage.appendChild(el);
      window.setTimeout(() => el.remove(), 1750);
    },
    [centerOf],
  );

  const wait = (ms: number) =>
    new Promise((r) => setTimeout(r, reduced() ? Math.min(ms, 60) : ms));

  return { stageRef, actor, fly, deny, pulse, chip, wait };
}
