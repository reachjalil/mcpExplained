/**
 * Tiny geometry helpers for the diagrams.
 *
 * Every node is described by its *centre* plus a width and height, which makes
 * moving a node between steps a one-line change and keeps the wire maths
 * symmetric.
 */

export type Pt = { x: number; y: number };

export type Box = {
  /** centre x */
  x: number;
  /** centre y */
  y: number;
  w: number;
  h: number;
};

export type Side = "top" | "right" | "bottom" | "left" | "center";

export function anchor(b: Box, side: Side, offset = 0): Pt {
  switch (side) {
    case "top":
      return { x: b.x + offset, y: b.y - b.h / 2 };
    case "bottom":
      return { x: b.x + offset, y: b.y + b.h / 2 };
    case "left":
      return { x: b.x - b.w / 2, y: b.y + offset };
    case "right":
      return { x: b.x + b.w / 2, y: b.y + offset };
    default:
      return { x: b.x, y: b.y };
  }
}

export function line(a: Pt, b: Pt): string {
  return `M ${r(a.x)} ${r(a.y)} L ${r(b.x)} ${r(b.y)}`;
}

/** Cubic bézier that leaves `a` horizontally and arrives at `b` horizontally. */
export function curveH(a: Pt, b: Pt, k = 0.5): string {
  const dx = (b.x - a.x) * k;
  return `M ${r(a.x)} ${r(a.y)} C ${r(a.x + dx)} ${r(a.y)}, ${r(b.x - dx)} ${r(
    b.y,
  )}, ${r(b.x)} ${r(b.y)}`;
}

/** Cubic bézier that leaves `a` vertically and arrives at `b` vertically. */
export function curveV(a: Pt, b: Pt, k = 0.55): string {
  const dy = (b.y - a.y) * k;
  return `M ${r(a.x)} ${r(a.y)} C ${r(a.x)} ${r(a.y + dy)}, ${r(b.x)} ${r(
    b.y - dy,
  )}, ${r(b.x)} ${r(b.y)}`;
}

/** An arc that bows out sideways — used for "reply" wires that must not
 *  overlap the outbound wire they run alongside. */
export function arc(a: Pt, b: Pt, bow = 40): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return `M ${r(a.x)} ${r(a.y)} Q ${r(mx + nx * bow)} ${r(my + ny * bow)}, ${r(
    b.x,
  )} ${r(b.y)}`;
}

/** Rounded orthogonal route: out of `a` vertically, across, into `b`. */
export function elbowV(a: Pt, b: Pt, radius = 12): string {
  const midY = (a.y + b.y) / 2;
  const dirY = Math.sign(b.y - a.y) || 1;
  const dirX = Math.sign(b.x - a.x) || 1;
  const rr = Math.min(radius, Math.abs(b.x - a.x) / 2, Math.abs(midY - a.y));
  if (Math.abs(b.x - a.x) < 1) return line(a, b);
  return [
    `M ${r(a.x)} ${r(a.y)}`,
    `L ${r(a.x)} ${r(midY - rr * dirY)}`,
    `Q ${r(a.x)} ${r(midY)} ${r(a.x + rr * dirX)} ${r(midY)}`,
    `L ${r(b.x - rr * dirX)} ${r(midY)}`,
    `Q ${r(b.x)} ${r(midY)} ${r(b.x)} ${r(midY + rr * dirY)}`,
    `L ${r(b.x)} ${r(b.y)}`,
  ].join(" ");
}

export function midpoint(a: Pt, b: Pt, t = 0.5): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Approximate rendered width of monospace chip text at a given font size. */
export function textWidth(text: string, fontSize = 10): number {
  return text.length * fontSize * 0.6;
}

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
