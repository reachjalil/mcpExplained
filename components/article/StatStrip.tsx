"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  color?: string;
};

/** Numbers that count up the first time they scroll into view. */
export function StatStrip({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  const [t, setT] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setGo(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setGo(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!go) return;
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start = performance.now();
    const DUR = reduced ? 0 : 1100;
    let raf = 0;
    const frame = (now: number) => {
      const p = DUR === 0 ? 1 : Math.min(1, (now - start) / DUR);
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [go]);

  return (
    <div className="stat-strip" ref={ref}>
      {stats.map((s) => (
        <div
          key={s.label}
          className="stat"
          style={
            s.color
              ? ({ "--stat-color": `var(--${s.color})` } as React.CSSProperties)
              : undefined
          }
        >
          <b>
            {s.prefix}
            {Math.round(s.value * t)}
            {s.suffix}
          </b>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}
