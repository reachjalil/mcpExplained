const COPY: Record<string, { label: string; title: string }> = {
  spec: {
    label: "spec today",
    title: "In merged spec / SEP text as of August 2026",
  },
  roadmap: {
    label: "roadmap",
    title: "Named as a current priority on the official MCP roadmap — not a commitment",
  },
  inference: {
    label: "inference",
    title: "The author's synthesis — not a normative MCP term",
  },
};

export function Evidence({ level }: { level: "spec" | "roadmap" | "inference" }) {
  const c = COPY[level];
  return (
    <span className="evidence" data-level={level} title={c.title}>
      {c.label}
    </span>
  );
}
