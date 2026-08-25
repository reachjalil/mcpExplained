"use client";

import { Fragment, useState } from "react";
import type { PayloadNote, PayloadTab } from "./payload";

/**
 * A tabbed protocol message with clickable fields. Click a highlighted token
 * and the side panel explains what that field is doing.
 */
export function PayloadInspector({
  fig,
  title,
  accent = "agent",
  tabs,
  notes,
  defaultNote,
}: {
  fig?: string;
  title: string;
  accent?: "agent" | "server" | "human" | "task" | "event" | "model";
  tabs: PayloadTab[];
  notes: PayloadNote[];
  defaultNote: string;
}) {
  const [tabId, setTabId] = useState(tabs[0].id);
  const [noteId, setNoteId] = useState(defaultNote);
  const [swap, setSwap] = useState(0);

  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0];
  const note = notes.find((n) => n.id === noteId) ?? notes[0];

  const openNote = (id: string) => {
    setNoteId(id);
    setSwap((s) => s + 1);
  };

  return (
    <div
      className="inspector bleed-wide"
      style={{ "--in-accent": `var(--${accent})` } as React.CSSProperties}
    >
      <div
        className="widget-head"
        style={{
          padding: "0.95rem 1.15rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h4>
          {fig ? (
            <span className="scene-figno" style={{ marginInlineEnd: "0.55rem" }}>
              {fig}
            </span>
          ) : null}
          {title}
        </h4>
        <p>Click the highlighted fields — each one is doing real work.</p>
      </div>
      {tabs.length > 1 ? (
        <div className="inspector-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              className="inspector-tab"
              aria-selected={t.id === tabId}
              onClick={() => setTabId(t.id)}
            >
              {t.tab}
            </button>
          ))}
        </div>
      ) : null}
      <div className="inspector-grid">
        <pre className="inspector-code">
          <code>
            {tab.lines.map((line, i) => (
              <Fragment key={i}>
                {line.map((seg, j) => {
                  if (typeof seg === "string") {
                    return (
                      <span key={j} className="tok">
                        {seg}
                      </span>
                    );
                  }
                  if (seg.t === "hot") {
                    return (
                      <button
                        key={j}
                        type="button"
                        className="tok-hot"
                        data-open={noteId === seg.id}
                        onClick={() => openNote(seg.id)}
                        style={{
                          font: "inherit",
                          border: "none",
                          background: "none",
                          padding: undefined,
                        }}
                      >
                        {seg.v}
                      </button>
                    );
                  }
                  return (
                    <span key={j} className={`tok-${seg.t}`}>
                      {seg.v}
                    </span>
                  );
                })}
                {"\n"}
              </Fragment>
            ))}
          </code>
        </pre>
        <div className="inspector-note" aria-live="polite">
          <div key={swap} className="inspector-note-swap">
            <span className="note-key">{note.title}</span>
            <p>{note.body}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
