import { skillGroups } from "../../data/content";

// A small neural network drawn in notebook ink.
// Input layer = skill groups, two hidden layers, one output: Harshit.
// Signals (blue dots) travel from the selected group through the neurons it
// "activates". While training, every group fires at once.
const W = 640, H = 420;
const X = { in: 190, h1: 334, h2: 456, out: 568 };

const spread = (n, top, bottom) => Array.from({ length: n }, (_, i) => (n === 1 ? (top + bottom) / 2 : top + (i * (bottom - top)) / (n - 1)));
const IN = spread(skillGroups.length, 38, H - 38).map((y, i) => ({ x: X.in, y, g: skillGroups[i] }));
const H1 = spread(6, 62, H - 62).map((y) => ({ x: X.h1, y }));
const H2 = spread(4, 112, H - 112).map((y) => ({ x: X.h2, y }));
const OUT = { x: X.out, y: H / 2 };

// deterministic "weights" so each group lights a different pattern
const w = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
function pattern(gi) {
  const h1 = H1.map((_, j) => 0.25 + 0.75 * w(gi + 1, j + 1));
  const h2 = H2.map((_, k) => 0.3 + 0.7 * w(gi + 7, k + 3));
  return { h1, h2 };
}
const PATTERNS = skillGroups.map((_, gi) => pattern(gi));

// three signal routes per group: input → strongest h1 → strongest h2 → output
function routes(gi) {
  const { h1, h2 } = PATTERNS[gi];
  const top1 = h1.map((v, j) => [v, j]).sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, j]) => j);
  const top2 = h2.map((v, k) => [v, k]).sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, k]) => k);
  return top1.map((j, r) => `M${IN[gi].x} ${IN[gi].y} L${H1[j].x} ${H1[j].y} L${H2[top2[r]].x} ${H2[top2[r]].y} L${OUT.x} ${OUT.y}`);
}
const ROUTES = skillGroups.map((_, gi) => routes(gi));

export default function NeuralNet({ active, onPick, training, done, reduce }) {
  const ai = skillGroups.findIndex((g) => g.id === active);
  const firing = training ? skillGroups.map((_, i) => i) : ai >= 0 ? [ai] : [];
  // neuron brightness = strongest activation from any firing input
  const act1 = H1.map((_, j) => Math.max(0, ...firing.map((gi) => PATTERNS[gi].h1[j])));
  const act2 = H2.map((_, k) => Math.max(0, ...firing.map((gi) => PATTERNS[gi].h2[k])));
  const lit = (gi) => firing.includes(gi);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full select-none" role="img" aria-label="A neural network: skill groups on the left feed two hidden layers and one output labelled Harshit. The skill list is next to it.">
      {/* edges */}
      <g strokeLinecap="round">
        {IN.map((a, gi) => H1.map((b, j) => {
          const on = lit(gi) && PATTERNS[gi].h1[j] > 0.5;
          return <line key={`a${gi}${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on ? "var(--blue)" : "var(--line-strong)"} strokeWidth={on ? 1.6 : 0.8} strokeOpacity={on ? 0.75 : 0.55} style={{ transition: "stroke .35s, stroke-opacity .35s" }} />;
        }))}
        {H1.map((a, j) => H2.map((b, k) => {
          const on = act1[j] > 0.5 && act2[k] > 0.5;
          return <line key={`b${j}${k}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on ? "var(--blue)" : "var(--line-strong)"} strokeWidth={on ? 1.5 : 0.8} strokeOpacity={on ? 0.6 : 0.5} style={{ transition: "stroke .35s" }} />;
        }))}
        {H2.map((a, k) => (
          <line key={`c${k}`} x1={a.x} y1={a.y} x2={OUT.x} y2={OUT.y} stroke={firing.length ? "var(--blue)" : "var(--line-strong)"} strokeWidth={firing.length ? 1.8 : 0.9} strokeOpacity={firing.length ? 0.65 : 0.5} style={{ transition: "stroke .35s" }} />
        ))}
      </g>

      {/* signals travelling through the net */}
      {!reduce && firing.map((gi) => (
        <g key={`p${gi}-${training ? "t" : active}`}>
          {ROUTES[gi].map((d, r) => (
            <circle key={r} r={training ? 3 : 4} fill={r === 0 ? "var(--red)" : "var(--blue)"} opacity="0">
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur={training ? "1.1s" : "2.2s"} begin={`${r * (training ? 0.3 : 0.7) + gi * (training ? 0.12 : 0)}s`} repeatCount="indefinite" />
              <animateMotion path={d} dur={training ? "1.1s" : "2.2s"} begin={`${r * (training ? 0.3 : 0.7) + gi * (training ? 0.12 : 0)}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      ))}

      {/* hidden neurons: fill shows activation */}
      {[...H1.map((n, j) => ({ ...n, a: act1[j], key: `h1${j}` })), ...H2.map((n, k) => ({ ...n, a: act2[k], key: `h2${k}` }))].map((n) => (
        <g key={n.key}>
          <circle cx={n.x} cy={n.y} r="13" fill="var(--card)" stroke="var(--ink)" strokeWidth="2" />
          <circle cx={n.x} cy={n.y} r="9" fill="var(--blue)" fillOpacity={n.a * 0.9} style={{ transition: "fill-opacity .4s" }} />
        </g>
      ))}

      {/* input layer: skill groups (click to pick) */}
      {IN.map((n, gi) => {
        const on = active === n.g.id || (training && lit(gi));
        return (
          <g key={n.g.id} className="cursor-pointer" onClick={() => onPick(n.g.id)} onMouseEnter={() => onPick(n.g.id, true)}>
            <rect x="0" y={n.y - 22} width={n.x + 18} height="44" fill="transparent" />
            <text x={n.x - 24} y={n.y + 7} textAnchor="end" fontFamily="Caveat, cursive" fontSize="23" fill={active === n.g.id ? "var(--blue)" : "var(--ink)"} style={{ transition: "fill .3s" }}>
              {n.g.name}{n.g.core ? " ★" : ""}
            </text>
            <circle cx={n.x} cy={n.y} r="12" fill={on ? "var(--hl)" : "var(--card)"} stroke="var(--ink)" strokeWidth="2" style={{ transition: "fill .3s" }} />
            {active === n.g.id && !reduce && (
              <circle cx={n.x} cy={n.y} r="12" fill="none" stroke="var(--blue)" strokeWidth="2">
                <animate attributeName="r" values="12;22" dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.6;0" dur="1.4s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}

      {/* output neuron */}
      <g>
        <circle cx={OUT.x} cy={OUT.y} r="36" fill={done ? "var(--hl)" : "var(--card)"} stroke="var(--ink)" strokeWidth="2.5" style={{ transition: "fill .4s" }} />
        {firing.length > 0 && !reduce && (
          <circle cx={OUT.x} cy={OUT.y} r="36" fill="none" stroke="var(--blue)" strokeWidth="2">
            <animate attributeName="r" values="36;52" dur={training ? "0.8s" : "1.6s"} repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.5;0" dur={training ? "0.8s" : "1.6s"} repeatCount="indefinite" />
          </circle>
        )}
        <text x={OUT.x} y={OUT.y + 6} textAnchor="middle" fontFamily="Fraunces Variable, Georgia, serif" fontWeight="600" fontSize="17" fill="var(--ink)">Harshit</text>
        <text x={OUT.x} y={OUT.y + 64} textAnchor="middle" fontFamily="Caveat, cursive" fontSize="22" fill="var(--red)">{done ? "prediction: hire ✓" : "output"}</text>
      </g>

      {/* layer labels */}
      <g fontFamily="JetBrains Mono Variable, monospace" fontSize="10" letterSpacing="1.5" fill="var(--muted)" textAnchor="middle">
        <text x={X.h1} y={H - 8}>HIDDEN 1</text>
        <text x={X.h2} y={H - 8}>HIDDEN 2</text>
      </g>
    </svg>
  );
}
