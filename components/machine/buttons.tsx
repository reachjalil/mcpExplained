"use client";

import type { ReactNode } from "react";

/** The brand dot, at clickable size. */
export function ShapeButton({
  onClick,
  hint,
  label,
  refCb,
  className = "",
}: {
  onClick: () => void;
  hint?: boolean;
  label: string;
  refCb?: (el: HTMLElement | null) => void;
  className?: string;
}) {
  return (
    <div className={["act", className].filter(Boolean).join(" ")}>
      <button
        type="button"
        className={hint ? "shape-btn is-hint" : "shape-btn"}
        onClick={onClick}
        aria-label={label}
        ref={refCb}
      />
      <span className="alabel">{hint ? <span className="click-hint">click</span> : "you"}</span>
    </div>
  );
}

export function RectButton({
  onClick,
  children,
  disabled = false,
  tone,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  tone?: "amber" | "red";
}) {
  return (
    <button
      type="button"
      className="rect-btn"
      onClick={onClick}
      disabled={disabled}
      data-tone={tone}
    >
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="mtoggle">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="tswitch" aria-hidden="true" />
      <span>{children}</span>
    </label>
  );
}
