import type { ReactNode } from "react";
import type { Box } from "./geometry";
import { textWidth } from "./geometry";
import type { NodeState, Role } from "./types";

const roleVar = (role: Role) => `var(--${role === "neutral" ? "text-faint" : role})`;

/* -------------------------------------------------------------------------- */
/* Nodes                                                                      */
/* -------------------------------------------------------------------------- */

export type SvgNodeProps = {
  box: Box;
  role?: Role;
  state?: NodeState;
  title: string;
  sub?: string;
  /** Small pill drawn on the node's top edge, e.g. a task id. */
  badge?: string;
  radius?: number;
  onClick?: () => void;
};

export function SvgNode({
  box,
  role = "server",
  state = "idle",
  title,
  sub,
  badge,
  radius = 11,
}: SvgNodeProps) {
  const { x, y, w, h } = box;
  return (
    <g
      className="sv-node"
      data-role={role}
      data-state={state}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <rect
        className="sv-node-halo"
        x={-w / 2 - 3}
        y={-h / 2 - 3}
        width={w + 6}
        height={h + 6}
        rx={radius + 3}
      />
      <rect
        className="sv-node-body"
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={radius}
      />
      <text
        className="sv-node-title"
        x={0}
        y={sub ? -3 : 0}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {title}
      </text>
      {sub ? (
        <text
          className="sv-node-sub"
          x={0}
          y={11}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {sub}
        </text>
      ) : null}
      {badge ? (
        <Chip
          x={0}
          y={-h / 2}
          text={badge}
          role={role}
          tone="solid"
          centered
        />
      ) : null}
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* Wires                                                                      */
/* -------------------------------------------------------------------------- */

export type WireProps = {
  d: string;
  role?: Role;
  state?: "idle" | "off" | "on" | "dead";
  /** `once` fires a single comet, `loop` keeps traffic running. */
  flow?: "once" | "loop" | null;
  /** Pass the scene's runKey so a one-shot comet restarts on every step. */
  runKey?: string;
  arrow?: boolean;
  dashed?: boolean;
  /** Comet duration in ms. */
  speed?: number;
  /** Adds a glowing dot that rides the path (needs CSS motion paths). */
  dot?: boolean;
  /** Draw the wire on with this delay in ms, instead of just fading it in. */
  draw?: number | null;
};

export function Wire({
  d,
  role = "agent",
  state = "idle",
  flow = null,
  runKey = "0",
  arrow = true,
  dashed = false,
  speed = 900,
  dot = false,
  draw = null,
}: WireProps) {
  const style = {
    "--wire-role": roleVar(role),
    "--comet-dur": `${speed}ms`,
  } as React.CSSProperties;

  return (
    <g style={style}>
      <path
        className={draw === null ? "sv-wire" : "sv-wire sv-draw"}
        d={d}
        data-state={state}
        data-style={dashed ? "dashed" : undefined}
        pathLength={draw === null ? undefined : 100}
        style={
          draw === null
            ? undefined
            : ({ "--draw-delay": `${draw}ms` } as React.CSSProperties)
        }
        markerEnd={arrow && state !== "off" ? `url(#amc-arrow-${role})` : undefined}
      />
      {flow ? (
        <path
          key={`comet-${runKey}`}
          className="sv-comet"
          data-mode={flow}
          d={d}
          pathLength={100}
        />
      ) : null}
      {flow && dot ? (
        <circle
          key={`dot-${runKey}`}
          className="sv-dot"
          r={4}
          style={{ offsetPath: `path("${d}")` } as React.CSSProperties}
        />
      ) : null}
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* Chips, labels, zones                                                       */
/* -------------------------------------------------------------------------- */

export type ChipProps = {
  x: number;
  y: number;
  text: string;
  role?: Role;
  tone?: "outline" | "solid";
  /** Centre the chip on (x, y) instead of hanging it below-right. */
  centered?: boolean;
  delay?: number;
  fontSize?: number;
};

export function Chip({
  x,
  y,
  text,
  role = "agent",
  tone = "outline",
  centered = true,
  delay = 0,
  fontSize = 10,
}: ChipProps) {
  const w = textWidth(text, fontSize) + 14;
  const h = fontSize + 8;
  const left = centered ? x - w / 2 : x;
  const top = centered ? y - h / 2 : y;
  return (
    <g
      className="sv-chip"
      data-tone={tone}
      style={
        {
          "--chip-role": roleVar(role),
          "--chip-delay": `${delay}ms`,
        } as React.CSSProperties
      }
    >
      <rect
        className="sv-chip-body"
        x={left}
        y={top}
        width={w}
        height={h}
        rx={h / 2}
      />
      <text
        className="sv-chip-text"
        x={left + w / 2}
        y={top + h / 2 + 0.5}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize }}
      >
        {text}
      </text>
    </g>
  );
}

export function Label({
  x,
  y,
  children,
  anchor = "middle",
  emph = false,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  emph?: boolean;
}) {
  return (
    <text
      className="sv-label"
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="middle"
      data-emph={emph ? "true" : undefined}
    >
      {children}
    </text>
  );
}

export function Caption({
  x,
  y,
  children,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      className="sv-caption"
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="middle"
    >
      {children}
    </text>
  );
}

export function Zone({
  x,
  y,
  w,
  h,
  role = "agent",
  label,
  opacity = 1,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  role?: Role;
  label?: string;
  opacity?: number;
}) {
  return (
    <g style={{ "--zone-role": roleVar(role) } as React.CSSProperties} opacity={opacity}>
      <rect className="sv-zone" x={x} y={y} width={w} height={h} rx={14} />
      {label ? (
        <text
          className="sv-label"
          x={x + 12}
          y={y + 13}
          data-emph="true"
          style={{ fill: roleVar(role) }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

/** A red cross drawn over something that just failed. */
export function Strike({ x, y, size = 13 }: { x: number; y: number; size?: number }) {
  return (
    <g className="sv-strike">
      <line x1={x - size} y1={y - size} x2={x + size} y2={y + size} />
      <line x1={x + size} y1={y - size} x2={x - size} y2={y + size} />
    </g>
  );
}

/** Fades and slides a group in or out between steps. */
export function Fade({
  show,
  children,
  dy = 6,
}: {
  show: boolean;
  children: ReactNode;
  dy?: number;
}) {
  return (
    <g
      className="sv-fade"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0px)" : `translateY(${dy}px)`,
        pointerEvents: show ? undefined : "none",
      }}
      aria-hidden={!show}
    >
      {children}
    </g>
  );
}
