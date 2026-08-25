import type { ReactNode } from "react";

export function PullQuote({
  children,
  source,
}: {
  children: ReactNode;
  source?: string;
}) {
  return (
    <blockquote className="pull-quote">
      <p>{children}</p>
      {source ? <footer>{source}</footer> : null}
    </blockquote>
  );
}
