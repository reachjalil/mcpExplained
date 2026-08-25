"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A labeled plate every toy lives in: hairline frame, a stage on graph paper,
 * optional controls, a rule that stamps in after you see it, and a caption.
 * Adds `in` on first view so actors drop in with a small stagger.
 */
export function Machine({
  stageRef,
  children,
  controls,
  rule,
  caption,
  minHeight = 152,
  label,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
  controls?: ReactNode;
  rule?: ReactNode;
  caption?: ReactNode;
  minHeight?: number;
  label: string;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={rootRef} className="machine" role="group" aria-label={label}>
      <div className="mplate">{label}</div>
      <div className="mstage" ref={stageRef} style={{ minHeight }}>
        {children}
      </div>
      {controls ? <div className="mcontrols">{controls}</div> : null}
      {rule}
      {caption ? <figcaption className="mcap">{caption}</figcaption> : null}
    </figure>
  );
}

/** An actor: shape + mono label. Register it on a stage via `refCb`. */
export function Actor({
  refCb,
  kind,
  name,
  ghost = false,
  className = "",
}: {
  refCb: (el: HTMLElement | null) => void;
  kind: "server" | "agent";
  name: string;
  ghost?: boolean;
  className?: string;
}) {
  return (
    <div className={["act", ghost ? "ghost" : "", className].filter(Boolean).join(" ")}>
      <span className={`ashape as-${kind}`} ref={refCb} />
      <span className="alabel">{name}</span>
    </div>
  );
}

export function Wall({ label, hit = false }: { label?: string; hit?: boolean }) {
  return (
    <div className={hit ? "wall hit" : "wall"} aria-hidden="true">
      {label ? <span className="wlabel">{label}</span> : null}
    </div>
  );
}

/**
 * The takeaway a machine mints after you've seen it. Same row language as
 * the boundary map: click, watch, keep the rule.
 */
export function Rule({
  show,
  pair,
  ok,
  why,
}: {
  show: boolean;
  pair: string;
  ok: boolean;
  why?: string;
}) {
  return (
    <div className="mrule" data-show={show}>
      <div className="mrule-inner">
        <span className="bpair">{pair}</span>
        <span className="bres" data-r={ok ? "yes" : "no"} aria-live="polite">
          <i>{ok ? "✓" : "✕"}</i>
        </span>
        {why ? <span className="bwhy">{why}</span> : null}
      </div>
    </div>
  );
}
