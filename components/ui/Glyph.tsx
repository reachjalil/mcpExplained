import type { ReactNode } from "react";

type Kind = "pill" | "ring" | "badge" | "win" | "x";

const PRESETS: Record<string, { kind: Kind; c: string }> = {
  request: { kind: "pill", c: "amber" },
  result: { kind: "pill", c: "teal" },
  agent: { kind: "ring", c: "ink" },
  server: { kind: "badge", c: "ink" },
  app: { kind: "win", c: "blue" },
  blocked: { kind: "x", c: "red" },
};

/**
 * Inline glyph + word, matching the shapes inside the machines:
 * <G k="request">request</G> renders an amber pill before the word.
 */
export function G({ k, children }: { k: keyof typeof PRESETS; children: ReactNode }) {
  const p = PRESETS[k];
  return (
    <span className={`g g-${p.kind}`} data-c={p.c}>
      <i aria-hidden="true">{p.kind === "x" ? "✕" : null}</i>
      {children}
    </span>
  );
}
