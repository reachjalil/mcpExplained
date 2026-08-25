import type { ReactNode } from "react";

export function ArticleHeader({
  kicker,
  title,
  standfirst,
  meta,
}: {
  kicker: string;
  title: ReactNode;
  standfirst: ReactNode;
  meta: string[];
}) {
  return (
    <header className="article-header">
      <span className="eyebrow">{kicker}</span>
      <h1>{title}</h1>
      <p className="standfirst">{standfirst}</p>
      <div className="byline">
        {meta.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </header>
  );
}

export function Section({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <>
      <h2 id={id}>
        <span className="h-num">{num}</span>
        {title}
      </h2>
      {children}
    </>
  );
}

export function Lede({ children }: { children: ReactNode }) {
  return <p className="lede">{children}</p>;
}

export function Callout({
  label,
  tone = "note",
  children,
}: {
  label: string;
  tone?: "note" | "caution" | "spec" | "aside";
  children: ReactNode;
}) {
  return (
    <aside className="callout" data-tone={tone}>
      <strong className="callout-label">{label}</strong>
      {children}
    </aside>
  );
}

export function KeyIdea({
  label = "The idea",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="key-idea">
      <span className="key-idea-label">{label}</span>
      {children}
    </div>
  );
}

export function Payload({
  title,
  role = "server",
  children,
}: {
  title: string;
  role?: "agent" | "server" | "human" | "task" | "event" | "danger";
  children: ReactNode;
}) {
  return (
    <div
      className="payload"
      style={{ "--accent-role": `var(--${role})` } as React.CSSProperties}
    >
      <div className="payload-head">
        <span className="dot" />
        {title}
      </div>
      <pre>{children}</pre>
    </div>
  );
}

export function Legend({
  items,
}: {
  items: Array<{ role: string; label: string }>;
}) {
  return (
    <div className="legend">
      {items.map((i) => (
        <span key={i.label}>
          <i style={{ "--swatch": `var(--${i.role})` } as React.CSSProperties} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="table-wrap">{children}</div>;
}

export type SourceItem = {
  title: string;
  note: string;
  href?: string;
};

export function Sources({ items }: { items: SourceItem[] }) {
  return (
    <ol className="sources">
      {items.map((s) => (
        <li key={s.title}>
          <strong>
            {s.href ? (
              <a href={s.href} target="_blank" rel="noreferrer noopener">
                {s.title}
              </a>
            ) : (
              s.title
            )}
          </strong>
          <span>{s.note}</span>
        </li>
      ))}
    </ol>
  );
}

export function Toc({
  items,
}: {
  items: Array<{ href: string; label: string; scene?: boolean }>;
}) {
  return (
    <nav className="toc" aria-label="Table of contents">
      <h2>Contents</h2>
      <ol>
        {items.map((i) => (
          <li key={i.href}>
            <a href={i.href} data-scene={i.scene ? "true" : undefined}>
              {i.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
