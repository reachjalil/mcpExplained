"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setRatio(max > 0 ? Math.min(1, doc.scrollTop / max) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="read-progress"
      aria-hidden="true"
      style={{ transform: `scaleX(${ratio})`, opacity: ratio > 0.005 ? 1 : 0 }}
    />
  );
}
