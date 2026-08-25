import type { Role } from "./types";

const ROLES: Role[] = [
  "agent",
  "server",
  "human",
  "model",
  "task",
  "event",
  "danger",
  "neutral",
];

/**
 * Arrowhead markers are defined once per document and referenced by every
 * scene. Ids are stable, so `url(#amc-arrow-agent)` resolves the same way in
 * every diagram.
 */
export function SceneDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        {ROLES.map((role) => (
          <marker
            key={role}
            id={`amc-arrow-${role}`}
            viewBox="0 0 10 10"
            refX="8.5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" className={`sv-marker-${role}`} />
          </marker>
        ))}
      </defs>
    </svg>
  );
}
