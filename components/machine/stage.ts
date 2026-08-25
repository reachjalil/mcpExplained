"use client";

import { useCallback, useRef } from "react";

type Pt = { x: number; y: number };

const pose = (x: number, y: number, ang: number, s = 1) =>
  `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${ang}deg) scale(${s})`;

function spawnPacket(kind: "req" | "res" = "req") {
  const el = document.createElement("span");
  el.className = `fdot${kind === "res" ? " fdot-res" : ""}`;
  el.innerHTML =
    kind === "res"
      ? `<svg viewBox="0 0 28 16" aria-hidden="true"><path d="M3.6 8 L8.2 2.6 H19.8 L24.4 8 L19.8 13.4 H8.2 Z"/></svg>`
      : `<svg viewBox="0 0 28 16" aria-hidden="true"><path d="M14 1.4 L26.2 8 L14 14.6 L1.8 8 Z"/></svg>`;
  return el;
}

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
 * `fly` spawns a packet and moves it between actor centres with WAAPI, resolving
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
      if (el) {
        el.dataset.actor = name;
        actors.current.set(name, el);
      } else {
        actors.current.delete(name);
      }
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
      const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

      const packet = spawnPacket(kind);
      if (tag) {
        const lab = document.createElement("span");
        lab.className = "ftag";
        lab.textContent = tag;
        lab.style.transform = `rotate(${-ang}deg)`;
        packet.appendChild(lab);
      }
      stage.appendChild(packet);

      const dur = reduced() ? 60 : duration * until;
      const anim = packet.animate(
        [
          { transform: pose(a.x, a.y, ang, 0.3), opacity: 0 },
          { transform: pose(a.x, a.y, ang, 1), opacity: 1, offset: 0.15 },
          { transform: pose(end.x, end.y, ang, 1), opacity: 1 },
        ],
        { duration: dur, easing: "cubic-bezier(.35,.75,.25,1)", fill: "forwards" },
      );
      await anim.finished.catch(() => {});

      const out = packet.animate(
        [
          { transform: pose(end.x, end.y, ang, 1), opacity: 1 },
          { transform: pose(end.x, end.y, ang, 0.4), opacity: 0 },
        ],
        { duration: reduced() ? 40 : 200, easing: "ease-in", fill: "forwards" },
      );
      await out.finished.catch(() => {});
      packet.remove();
      return end;
    },
    [centerOf],
  );

  /** A call that hits a boundary: travels partway, ✕ pops, the packet falls. */
  const deny = useCallback(
    async ({ from, to, until = 0.5, duration = 620 }: FlyOpts) => {
      const stage = stageRef.current;
      if (!stage) return;
      const a = centerOf(from);
      const b = centerOf(to);
      const end = { x: a.x + (b.x - a.x) * until, y: a.y + (b.y - a.y) * until };
      const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

      const packet = spawnPacket("req");
      stage.appendChild(packet);

      const slow = reduced();
      const anim = packet.animate(
        [
          { transform: pose(a.x, a.y, ang, 0.3), opacity: 0 },
          { transform: pose(a.x, a.y, ang, 1), opacity: 1, offset: 0.15 },
          { transform: pose(end.x, end.y, ang, 1), opacity: 1 },
        ],
        { duration: slow ? 60 : duration * until, easing: "cubic-bezier(.4,.6,.5,1)", fill: "forwards" },
      );
      await anim.finished.catch(() => {});

      const x = document.createElement("span");
      x.className = "popx";
      x.textContent = "✕";
      x.style.left = `${end.x}px`;
      x.style.top = `${end.y - 24}px`;
      stage.appendChild(x);
      window.setTimeout(() => x.remove(), 950);

      const back = Math.sign(a.x - b.x) * 42;
      const fall = packet.animate(
        [
          { transform: pose(end.x, end.y, ang, 1), opacity: 1 },
          {
            transform: pose(end.x + back, end.y + 8, ang + 28, 0.9),
            opacity: 1,
            offset: 0.45,
          },
          {
            transform: pose(end.x + back * 1.3, end.y + 44, ang + 70, 0.7),
            opacity: 0,
          },
        ],
        { duration: slow ? 40 : 520, easing: "cubic-bezier(.3,.6,.6,1)", fill: "forwards" },
      );
      await fall.finished.catch(() => {});
      packet.remove();
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

  /** Transient mono chip above an actor. Portaled to the body so the board
   *  frame never clips it; clamped so it stays on screen. */
  const chip = useCallback(
    (name: string, text: string, tone: "res" | "deny" | "ink" = "ink", dy = -44) => {
      const host = actors.current.get(name);
      if (!host) return;
      const r = host.getBoundingClientRect();
      const el = document.createElement("span");
      el.className = "mchip";
      el.dataset.tone = tone;
      el.textContent = text;
      el.style.left = `${r.left + r.width / 2}px`;
      el.style.top = `${r.top + r.height / 2 + dy}px`;
      document.body.appendChild(el);
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const pad = 12;
      const x = Math.min(
        window.innerWidth - pad - w / 2,
        Math.max(pad + w / 2, r.left + r.width / 2),
      );
      const y = Math.min(
        window.innerHeight - pad - h / 2,
        Math.max(pad + h / 2, r.top + r.height / 2 + dy),
      );
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      window.setTimeout(() => el.remove(), 1750);
    },
    [],
  );

  const wait = (ms: number) =>
    new Promise((r) => setTimeout(r, reduced() ? Math.min(ms, 60) : ms));

  return { stageRef, actor, fly, deny, pulse, chip, wait };
}
