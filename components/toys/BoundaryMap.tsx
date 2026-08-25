import { InView } from "@/components/ui/InView";

const ROWS = [
  { pair: "server → server", r: "no", why: "strangers by design" },
  { pair: "app → server", r: "no", why: "sandboxed, no keys" },
  { pair: "app → agent", r: "yes", why: "asking is allowed" },
  { pair: "agent → server", r: "yes", why: "it holds the connection" },
] as const;

/** §6 — the whole article as five rows that pop in on scroll. */
export function BoundaryMap() {
  return (
    <InView as="figure" className="bmap" threshold={0.5}>
      {ROWS.map((row) => (
        <div className="brow" key={row.pair}>
          <span className="bpair">{row.pair}</span>
          <span className="bres" data-r={row.r}>
            <i>{row.r === "yes" ? "✓" : "✕"}</i>
          </span>
          <span className="bwhy">{row.why}</span>
        </div>
      ))}
      <div className="brow">
        <span className="bpair">agent → your money</span>
        <span className="bres" data-r="yes">
          <i className="flipA" style={{ color: "var(--red)" }}>
            ✕
          </i>
          <i className="flipB">✓</i>
        </span>
        <span className="bwhy">…until you say yes</span>
      </div>
    </InView>
  );
}
