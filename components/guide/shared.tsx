import type { ReactNode } from "react";

export type Side = "server" | "agent" | "both";

const SIDE_LABEL: Record<Side, string> = {
  server: "server",
  agent: "agent",
  both: "both sides",
};

export type Fact = { k: string; v: ReactNode };

/** Keyed fact rows: the scannable core of every card. No paragraphs. */
export function GFacts({ items }: { items: Fact[] }) {
  return (
    <ul className="gfacts">
      {items.map((f, i) => (
        <li key={`${f.k}-${i}`}>
          <span className="k">{f.k}</span>
          <span>{f.v}</span>
        </li>
      ))}
    </ul>
  );
}

/** A reference card: name, side, methods, keyed facts, demo, spec link. */
export function GCard({
  id,
  side,
  title,
  methods,
  facts,
  children,
  spec,
  specLabel,
}: {
  id: string;
  side: Side;
  title: string;
  methods: string[];
  facts: Fact[];
  children: ReactNode;
  spec: string;
  specLabel: string;
}) {
  return (
    <section className="gcard" id={id}>
      <div className="gcard-head">
        <h3>{title}</h3>
        <span className="gside">
          <i data-g={side === "agent" ? "host" : side} aria-hidden="true" />
          {SIDE_LABEL[side]}
        </span>
      </div>
      <p className="mchips">
        {methods.map((m) => (
          <code key={m}>{m}</code>
        ))}
      </p>
      <GFacts items={facts} />
      {children}
      <p className="specref">
        <b>spec</b>
        <a href={spec} target="_blank" rel="noreferrer noopener">
          {specLabel}
        </a>
      </p>
    </section>
  );
}

/** Full-width section for the parts that are not server/agent paired. */
export function GWide({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="gwide" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
