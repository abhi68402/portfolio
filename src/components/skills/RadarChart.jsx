import { m } from "motion/react";

// Hand-drawn SVG radar chart. One spoke per skill group; the amber shape
// shows how strong each group is (0–100). `highlight` lights up one spoke.
export default function RadarChart({ groups, highlight }) {
  const R = 110; // radius of the 100% ring
  const n = groups.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2; // start at 12 o'clock
  const point = (i, value) => [Math.cos(angle(i)) * R * (value / 100), Math.sin(angle(i)) * R * (value / 100)];
  const shape = groups.map((g, i) => point(i, g.level).join(",")).join(" ");

  return (
    <svg viewBox="-170 -150 340 300" className="w-full" role="img" aria-label={`Radar chart of skill groups: ${groups.map((g) => `${g.name} ${g.level}%`).join(", ")}`}>
      {/* rings at 25 / 50 / 75 / 100 % */}
      {[25, 50, 75, 100].map((v) => (
        <polygon
          key={v}
          points={groups.map((_, i) => point(i, v).join(",")).join(" ")}
          fill="none"
          stroke="var(--line)"
          strokeDasharray={v === 100 ? "0" : "2 4"}
        />
      ))}
      {/* spokes + labels */}
      {groups.map((g, i) => {
        const [x, y] = point(i, 100);
        const [lx, ly] = point(i, 128);
        const on = highlight === g.id;
        return (
          <g key={g.id}>
            <line x1="0" y1="0" x2={x} y2={y} stroke={on ? "var(--accent)" : "var(--line)"} strokeWidth={on ? 2 : 1} />
            <text
              x={lx}
              y={ly}
              textAnchor={Math.abs(lx) < 10 ? "middle" : lx > 0 ? "start" : "end"}
              dominantBaseline="middle"
              className="font-mono"
              fontSize="10.5"
              letterSpacing="1.2"
              fill={on ? "var(--accent)" : "var(--muted)"}
            >
              {g.name.toUpperCase()}
            </text>
          </g>
        );
      })}
      {/* the data shape grows from the centre when it scrolls into view */}
      <m.g initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
        <polygon points={shape} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
        {groups.map((g, i) => {
          const [x, y] = point(i, g.level);
          return <circle key={g.id} cx={x} cy={y} r={highlight === g.id ? 5 : 3} fill="var(--accent)" />;
        })}
      </m.g>
      <circle r="2" fill="var(--muted)" />
    </svg>
  );
}
