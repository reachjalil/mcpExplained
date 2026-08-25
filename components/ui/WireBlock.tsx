import type { ReactNode } from "react";

/**
 * A small log of real protocol traffic, shown under a machine so the
 * abstract line gets a concrete shape. Direction markers render as <b>,
 * annotations as <i>.
 */
export function WireBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <figure className="wire">
      <figcaption>{label}</figcaption>
      <pre>{children}</pre>
    </figure>
  );
}
