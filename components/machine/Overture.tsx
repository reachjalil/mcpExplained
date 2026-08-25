"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

export type SyllabusItem = {
  n: string;
  title: string;
  hint: string;
  href: string;
};

/**
 * Title sequence every article opens with: a drawing board, a prompt to act,
 * and a syllabus that stamps in after the reader has done the first click.
 * Fig. 00 — does not increment the machine counter.
 */
export function Overture({
  label,
  stageRef,
  children,
  prompt,
  syllabus,
  showSyllabus,
  minHeight = 280,
  phase,
}: {
  label: string;
  stageRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  prompt: ReactNode;
  syllabus: SyllabusItem[];
  showSyllabus: boolean;
  minHeight?: number;
  phase: string;
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
      data-phase={phase}
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
      <div className="osylla" data-show={showSyllabus}>
        <div className="osylla-inner">
          <p className="osylla-k">you&apos;ll prove these by clicking</p>
          {syllabus.map((row) => (
            <a className="osylla-row" href={row.href} key={row.n}>
              <span className="osylla-n">{row.n}</span>
              <span className="osylla-t">{row.title}</span>
              <span className="osylla-h">{row.hint}</span>
            </a>
          ))}
        </div>
      </div>
    </figure>
  );
}
