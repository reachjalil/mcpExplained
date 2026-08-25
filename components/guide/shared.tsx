import type { ReactNode } from "react";

export type Side = "server" | "host" | "both";

const SIDE_LABEL: Record<Side, string> = {
  server: "server",
  host: "host",
  both: "both sides",
};

/** A compact reference card: name, side, methods, one-line definition,
 *  facts, a demo whose animation carries the concept, and the spec link. */
export function GCard({
  id,
  side,
  title,
  methods,
  def,
  facts,
  children,
  spec,
  specLabel,
}: {
  id: string;
  side: Side;
  title: string;
  methods: string[];
  def: ReactNode;
  facts: ReactNode[];
  children: ReactNode;
  spec: string;
  specLabel: string;
}) {
  return (
    <section className="gcard" id={id}>
      <div className="gcard-head">
        <h3>{title}</h3>
        <span className="gside">
          <i data-g={side} aria-hidden="true" />
          {SIDE_LABEL[side]}
        </span>
      </div>
      <p className="gdef">{def}</p>
      <p className="mchips">
        {methods.map((m) => (
          <code key={m}>{m}</code>
        ))}
      </p>
      <ul className="gfacts">
        {facts.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
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

/** Full-width section for the non-paired parts of the guide. */
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
