"use client";

import type { ReactNode } from "react";

/** The amber circle you click — with the little drawn cursor, like a finger
 *  hovering over the machine. */
export function ShapeButton({
  onClick,
  hint,
  label,
  refCb,
}: {
  onClick: () => void;
  hint?: boolean;
  label: string;
  refCb?: (el: HTMLElement | null) => void;
}) {
  return (
    <div className="act">
      <button
        type="button"
        className="shape-btn"
        onClick={onClick}
        aria-label={label}
        ref={refCb}
      >
        <svg className="cursor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5 2 L19 12.5 L12.6 13.6 L16 21 L13 22.3 L9.6 15 L5 19.5 Z"
            fill="#191710"
            stroke="#f2efe6"
            strokeWidth="1.6"
          />
        </svg>
      </button>
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
