/**
 * The ambient constellation behind hero sections: a static wire layout with
 * slow comets riding the wires. Pure CSS animation; pauses under
 * prefers-reduced-motion via the stylesheet.
 */
const WIRES = [
  { d: "M 60 300 C 220 180, 380 190, 520 240", role: "agent", dur: 11, delay: 0 },
  { d: "M 520 240 C 640 280, 760 200, 900 150", role: "server", dur: 9, delay: -3 },
  { d: "M 120 80 C 280 120, 420 170, 520 240", role: "server", dur: 12, delay: -6 },
  { d: "M 520 240 C 600 330, 740 360, 880 330", role: "event", dur: 10, delay: -2 },
  { d: "M 520 240 C 460 120, 620 60, 780 70", role: "task", dur: 13, delay: -8 },
  { d: "M 200 380 C 320 340, 420 300, 520 240", role: "human", dur: 12, delay: -4 },
];

const NODES = [
  { x: 60, y: 300, r: 5 },
  { x: 120, y: 80, r: 5 },
  { x: 900, y: 150, r: 5 },
  { x: 880, y: 330, r: 5 },
  { x: 780, y: 70, r: 5 },
  { x: 200, y: 380, r: 5 },
];

export function Ambient() {
  return (
    <svg
      className="ambient"
      viewBox="0 0 960 420"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {WIRES.map((w, i) => (
        <g key={i}>
          <path className="amb-wire" d={w.d} />
          <path
            className="amb-comet"
            d={w.d}
            pathLength={100}
            style={
              {
                stroke: `var(--${w.role})`,
                "--amb-dur": `${w.dur}s`,
                "--amb-delay": `${w.delay}s`,
              } as React.CSSProperties
            }
          />
        </g>
      ))}
      {NODES.map((n, i) => (
        <circle key={i} className="amb-node" cx={n.x} cy={n.y} r={n.r} />
      ))}
      <circle
        className="amb-node amb-core"
        cx={520}
        cy={240}
        r={10}
        style={{ stroke: "var(--agent)", strokeWidth: 2 }}
      />
    </svg>
  );
}
