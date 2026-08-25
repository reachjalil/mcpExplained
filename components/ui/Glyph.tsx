import type { ReactNode } from "react";

type Kind = "dot" | "sq" | "win" | "x";

const PRESETS: Record<string, { kind: Kind; c: string }> = {
  request: { kind: "dot", c: "amber" },
  result: { kind: "dot", c: "teal" },
  agent: { kind: "dot", c: "ink" },
  server: { kind: "sq", c: "ink" },
  app: { kind: "win", c: "blue" },
  blocked: { kind: "x", c: "red" },
};

/**
 * Inline glyph + word, matching the shapes inside the machines:
 * <G k="request">request</G> renders an amber dot before the word.
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
