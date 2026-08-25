import type { ReactNode } from "react";
import { InView } from "@/components/ui/InView";

export type Side = "server" | "host" | "both";

const SIDE_LABEL: Record<Side, string> = {
  server: "server side",
  host: "host side",
  both: "both sides",
};

/** A guide section: side marker, anchored heading, spec-method chips. */
export function GSection({
  id,
  side,
  title,
  methods,
  children,
}: {
  id: string;
  side: Side;
  title: string;
  methods?: string[];
  children: ReactNode;
}) {
  return (
    <section>
      <p className="gside">
        <i data-g={side} aria-hidden="true" />
        {SIDE_LABEL[side]}
      </p>
      <InView as="h2" threshold={0.9} id={id}>
        <span className="hu">{title}</span>
      </InView>
      {methods && methods.length ? (
        <p className="mchips">
          {methods.map((m) => (
            <code key={m}>{m}</code>
          ))}
        </p>
      ) : null}
      {children}
    </section>
  );
}

/** The reference line that closes a section: spec link plus siblings. */
export function SpecRef({
  href,
  label,
  extra,
}: {
  href: string;
  label: string;
  extra?: ReactNode;
}) {
  return (
    <p className="specref">
      <b>spec</b>
      <a href={href} target="_blank" rel="noreferrer noopener">
        {label}
      </a>
      {extra}
    </p>
  );
}
