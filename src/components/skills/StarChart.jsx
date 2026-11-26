import { skillGroups } from "../../data/content";

// Each skill group is a constellation; each skill a star (bigger = stronger).
// `active` lights one group up; hovering/focusing a group calls onActive.
const W = 600, H = 380;

function layout() {
  const cols = 3, cellW = W / cols, cellH = H / 2;
  return skillGroups.map((g, gi) => {
    const cx = (gi % cols) * cellW, cy = Math.floor(gi / cols) * cellH;
    const n = g.skills.length;
    const stars = g.skills.map((s, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      // a gentle zig-zag across the cell, varied per group
      const x = cx + 30 + t * (cellW - 60);
      const y = cy + 60 + Math.sin(t * Math.PI * (1.2 + gi * 0.3) + gi) * 32 + (i % 2 ? 18 : -10);
      return { ...s, x, y, r: 2.5 + (s.level / 100) * 5 };
    });
    return { ...g, stars, labelX: cx + cellW / 2, labelY: cy + cellH - 24 };
  });
}
const GROUPS = layout();

export default function StarChart({ active, onActive }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Star chart of skill groups. The full list with levels is next to it.">
      {GROUPS.map((g) => {
        const on = active === g.id;
        return (
          <g
            key={g.id}
            onMouseEnter={() => onActive(g.id)}
            onMouseLeave={() => onActive(null)}
            className="cursor-pointer"
            style={{ transition: "opacity .3s", opacity: active && !on ? 0.35 : 1 }}
          >
            <rect x={g.labelX - 100} y={g.labelY - 150} width="200" height="190" fill="transparent" />
            <polyline
              points={g.stars.map((s) => `${s.x},${s.y}`).join(" ")}
              fill="none"
              stroke={on ? "var(--blue)" : "var(--line-strong)"}
              strokeWidth={on ? 2 : 1.4}
              strokeDasharray={on ? "0" : "4 5"}
              strokeLinecap="round"
            />
            {g.stars.map((s) => (
              <g key={s.name}>
                <circle cx={s.x} cy={s.y} r={s.r + (on ? 1.5 : 0)} fill={on ? "var(--blue)" : "var(--ink)"} />
                {on && <circle cx={s.x} cy={s.y} r={s.r + 6} fill="none" stroke="var(--blue)" strokeOpacity="0.35" />}
                <text x={s.x} y={s.y - s.r - 7} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono Variable, monospace" fill={on ? "var(--blue)" : "var(--muted)"}>
                  {s.name.split(" ")[0]}
                </text>
              </g>
            ))}
            <text x={g.labelX} y={g.labelY} textAnchor="middle" fontSize="26" fontFamily="Caveat, cursive" fill={on ? "var(--red)" : "var(--ink)"}>
              {g.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
