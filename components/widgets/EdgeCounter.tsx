"use client";

import { useMemo, useState } from "react";

/**
 * Drag n and watch the mesh explode: integrations-to-own under point-to-point
 * wiring versus one-contract-per-server under an agent.
 */
export function EdgeCounter() {
  const [n, setN] = useState(6);
  const [mode, setMode] = useState<"mesh" | "star">("mesh");

  const mesh = (n * (n - 1)) / 2;
  const positions = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return { x: 150 + Math.cos(a) * 108, y: 130 + Math.sin(a) * 100 };
    });
  }, [n]);

  const fill = ((n - 3) / (12 - 3)) * 100;

  return (
    <div className="edge-widget bleed-wide">
      <div className="widget-head">
        <h4><span className="scene-figno" style={{ marginInlineEnd: "0.55rem" }}>Fig. 2</span>Integrations you have to own</h4>
        <p>
          Drag the number of capabilities. Then flip who holds the workflow.
        </p>
      </div>
      <div className="edge-body">
        <div className="edge-slider">
          <label>
            capabilities in your stack
            <output>{n}</output>
          </label>
          <input
            type="range"
            className="nrange"
            min={3}
            max={12}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            style={{ "--fill": `${fill}%` } as React.CSSProperties}
            aria-label="Number of capabilities"
          />
          <div className="edge-mode" role="group" aria-label="Topology">
            <button
              type="button"
              aria-pressed={mode === "mesh"}
              onClick={() => setMode("mesh")}
            >
              Hard-wired
            </button>
            <button
              type="button"
              aria-pressed={mode === "star"}
              onClick={() => setMode("star")}
            >
              Agent-mediated
            </button>
          </div>
          <div className="edge-readouts">
            <div
              className="edge-readout"
              style={{ "--er": "var(--danger)" } as React.CSSProperties}
            >
              <b>{mesh}</b>
              <span>
                point-to-point integrations — each one written, versioned,
                paged-for
              </span>
            </div>
            <div
              className="edge-readout"
              style={{ "--er": "var(--agent)" } as React.CSSProperties}
            >
              <b>{n}</b>
              <span>
                MCP connections — each server implements only its own contract
              </span>
            </div>
          </div>
        </div>

        <svg
          className="edge-graph"
          viewBox="0 0 300 260"
          role="img"
          aria-label={
            mode === "mesh"
              ? `${mesh} integrations between ${n} services`
              : `${n} connections through one agent`
          }
        >
          {mode === "mesh"
            ? positions.flatMap((a, i) =>
                positions.slice(i + 1).map((b, j) => (
                  <line
                    key={`${i}-${j}`}
                    className="mesh-line"
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                  />
                )),
              )
            : positions.map((p, i) => (
                <line
                  key={i}
                  className="star-line"
                  x1={150}
                  y1={130}
                  x2={p.x}
                  y2={p.y}
                />
              ))}
          {positions.map((p, i) => (
            <circle key={i} className="graph-node" cx={p.x} cy={p.y} r={7} />
          ))}
          {mode === "star" ? (
            <circle className="graph-agent" cx={150} cy={130} r={11} />
          ) : null}
        </svg>
      </div>
    </div>
  );
}
