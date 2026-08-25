"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The white card every toy lives in: hard offset shadow, a stage for actors
 * and dots, an optional controls row and caption. Adds `in` on first view so
 * actors drop in with a small stagger (see machine.css).
 */
export function Machine({
  stageRef,
  children,
  controls,
  caption,
  minHeight = 152,
  label,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
  controls?: ReactNode;
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
      <div className="mstage" ref={stageRef} style={{ minHeight }}>
        {children}
      </div>
      {controls ? <div className="mcontrols">{controls}</div> : null}
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
}: {
  refCb: (el: HTMLElement | null) => void;
  kind: "server" | "agent";
  name: string;
  ghost?: boolean;
}) {
  return (
    <div className={ghost ? "act ghost" : "act"}>
      <span className={`ashape as-${kind}`} ref={refCb}>
        {kind === "agent" ? "✳" : null}
      </span>
      <span className="alabel">{name}</span>
    </div>
  );
}

export function Wall({ label }: { label?: string }) {
  return (
    <div className="wall" aria-hidden="true">
      {label ? <span className="wlabel">{label}</span> : null}
    </div>
  );
}
