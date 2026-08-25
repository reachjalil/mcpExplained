"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

/**
 * Fig. 00, the plate an article opens on: a stage, and one line of prompt
 * whose copy changes as you act.
 *
 * Deliberately fixed height. Nothing expands, stamps in, or opens under the
 * board after a click, so the article below never jumps. The prompt reserves
 * two lines from first paint for the same reason.
 */
export function Overture({
  label,
  stageRef,
  children,
  prompt,
  tone,
  minHeight = 168,
}: {
  label: string;
  stageRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  prompt: ReactNode;
  tone: "ask" | "blocked" | "done";
  minHeight?: number;
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
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure
      ref={rootRef}
      className="machine overture"
      data-tone={tone}
      role="group"
      aria-label={label}
    >
      <div className="mplate">{label}</div>
      <div className="mstage" ref={stageRef} style={{ minHeight }}>
        {children}
      </div>
      <p className="oprompt" aria-live="polite">
        <i className="odot" aria-hidden="true" />
        <span>{prompt}</span>
      </p>
    </figure>
  );
}
