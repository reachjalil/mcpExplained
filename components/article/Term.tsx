import type { ReactNode } from "react";

/** Inline glossary term with a hover/focus tooltip. */
export function Term({ children, tip }: { children: ReactNode; tip: string }) {
  return (
    <dfn className="term" tabIndex={0}>
      {children}
      <span role="tooltip">{tip}</span>
    </dfn>
  );
}
