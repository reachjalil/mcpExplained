"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Adds the class `in` the first time the element scrolls into view.
 * All actual animation lives in CSS, keyed off `.iv.in` (or a component's own
 * `.in` rules, e.g. the machine's actor drop-in and the boundary map rows).
 */
export function InView({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  threshold = 0.25,
  id,
}: {
  children: ReactNode;
  as?: "div" | "section" | "h2" | "figure";
  className?: string;
  delay?: number;
  threshold?: number;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
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
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      id={id}
      style={delay ? ({ "--iv-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
