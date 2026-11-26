import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { nowBuilding, stats } from "../../data/content";
import { safeGet, safeSet } from "../../hooks/storage";
import Sketch from "../notebook/Sketch";

// Three small toys under the hero: what I'm building now, real numbers from my projects,
// and a wave button. Light fun; none of them hide any information.
export default function HeroTiles() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-8 sm:px-6 md:grid-cols-3">
      <h2 className="sr-only">At a glance</h2>
      <NowBuilding />
      <ByTheNumbers />
      <Wave />
    </div>
  );
}

function NowBuilding() {
  return (
    <article className="card tilt-l lift p-5">
      <p className="hud-label flex items-center gap-2"><span className="pulse-dot h-2 w-2 rounded-full bg-red" /> Now building</p>
      <h3 className="mt-2 font-serif text-2xl font-semibold">{nowBuilding.title}</h3>
      <p className="text-sm text-muted">{nowBuilding.what}</p>
      <div className="mt-4 h-3 overflow-hidden rounded-full border border-line bg-card-2" role="progressbar" aria-label={`${nowBuilding.title} progress`} aria-valuenow={nowBuilding.progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-[repeating-linear-gradient(45deg,var(--blue)_0_8px,color-mix(in_srgb,var(--blue)_75%,white)_8px_16px)]" style={{ width: `${nowBuilding.progress}%` }} />
      </div>
      <p className="mt-2 font-hand text-xl text-red">{nowBuilding.progress}% · compiling dreams</p>
    </article>
  );
}

// "By the numbers": real figures from the projects, counting up once the
// tile scrolls into view. Edit them in `stats` in content.js.
function ByTheNumbers() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <article ref={ref} className="card tape-blue tape lift relative p-5">
      <p className="hud-label">By the numbers</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <span className="block whitespace-nowrap font-serif text-[1.6rem] font-semibold leading-none text-blue tabular">
                <Counter to={s.value} run={inView} />{s.suffix}
              </span>
              <span className="mt-1 block text-xs leading-snug text-muted" aria-hidden="true">{s.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function Counter({ to, run }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!run || reduce) { if (reduce) setN(to); return; }
    let raf, start;
    const step = (t) => {
      start ??= t;
      const p = Math.min(1, (t - start) / 1200);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, to, reduce]);
  return n.toLocaleString("en-IN");
}

function Wave() {
  const [count, setCount] = useState(() => Number(safeGet("waves", 0)) || 0);
  const [waving, setWaving] = useState(0);
  const wave = () => {
    setCount((c) => { safeSet("waves", String(c + 1)); return c + 1; });
    setWaving((w) => w + 1);
  };
  const reply = count === 0 ? "Go on, say hi." : count < 3 ? "He waved back! (in spirit)" : count < 10 ? `That's ${count} waves. You're friends now.` : `${count} waves?! Just email him already 😄`;
  return (
    <article className="card tilt-r lift relative overflow-hidden p-5">
      <Sketch kind="comet" className="absolute -right-3 -top-3 h-20 w-20 text-blue/40" />
      <p className="hud-label">Wave at Harshit</p>
      <button
        type="button"
        onClick={wave}
        aria-label="Wave at Harshit"
        className="mt-3 grid h-20 w-20 place-items-center rounded-full border-2 border-ink bg-hl/60 text-4xl shadow-[3px_3px_0_var(--ink)] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--ink)]"
      >
        <span key={waving} className={waving ? "inline-block origin-[70%_70%] animate-[wave_0.9s_ease-in-out]" : "inline-block"}>👋</span>
      </button>
      <p className="mt-3 text-sm text-muted" aria-live="polite">{reply}</p>
    </article>
  );
}
