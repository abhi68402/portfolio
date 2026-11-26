import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { dadJokes, nowBuilding } from "../../data/content";
import { safeGet, safeSet } from "../../hooks/storage";
import Sketch from "../notebook/Sketch";

// Three small toys under the hero: what I'm building now, a dad-joke "model",
// and a wave button. Light fun; none of them hide any information.
export default function HeroTiles() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-8 sm:px-6 md:grid-cols-3">
      <h2 className="sr-only">At a glance</h2>
      <NowBuilding />
      <JokeModel />
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

// "Dad-joke model": jokes stream in word by word like a chatbot reply.
// Temperature picks the pool: low = mild puns, high = spicy/absurd ones.
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function JokeModel() {
  const reduce = useReducedMotion();
  const [temp, setTemp] = useState(0.7);
  const [joke, setJoke] = useState(null);
  const [shown, setShown] = useState({ setup: "", punch: "" });
  const [phase, setPhase] = useState("idle"); // idle | setup | think | punch | done
  const [rated, setRated] = useState(false);
  const [score, setScore] = useState(() => ({ laughs: Number(safeGet("joke-laughs", 0)) || 0, groans: Number(safeGet("joke-groans", 0)) || 0 }));
  const decks = useRef({ mild: [], spicy: [] });
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const draw = (pool) => {
    if (!decks.current[pool].length) decks.current[pool] = shuffle(dadJokes[pool]);
    return decks.current[pool].pop();
  };

  const generate = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const pool = temp < 0.6 ? "mild" : temp > 1.0 ? "spicy" : Math.random() < (temp - 0.6) / 0.4 ? "spicy" : "mild";
    const j = draw(pool);
    setJoke({ ...j, pool });
    setRated(false);
    if (reduce) { setShown(j); setPhase("done"); return; }
    const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    const sw = j.setup.split(" "), pw = j.punch.split(" ");
    setShown({ setup: "", punch: "" });
    setPhase("setup");
    sw.forEach((_, i) => later(() => setShown({ setup: sw.slice(0, i + 1).join(" "), punch: "" }), 60 * (i + 1)));
    const t1 = 60 * sw.length + 150;
    later(() => setPhase("think"), t1);
    const t2 = t1 + 750;
    later(() => setPhase("punch"), t2);
    pw.forEach((_, i) => later(() => setShown({ setup: j.setup, punch: pw.slice(0, i + 1).join(" ") }), t2 + 70 * (i + 1)));
    later(() => setPhase("done"), t2 + 70 * pw.length + 50);
  };

  const rate = (kind) => {
    if (rated) return;
    setRated(true);
    setScore((s) => {
      const next = { ...s, [kind]: s[kind] + 1 };
      safeSet(`joke-${kind}`, String(next[kind]));
      if (kind === "groans" && next.groans % 5 === 0) {
        window.dispatchEvent(new CustomEvent("bolt", { detail: { text: `${next.groans} groans! I'll tell him to keep his day job.`, mood: "wow" } }));
      }
      return next;
    });
  };

  const streaming = phase === "setup" || phase === "think" || phase === "punch";
  const tempLabel = temp < 0.6 ? "safe puns" : temp > 1.0 ? "unhinged" : "balanced";

  return (
    <article className="card tape-blue tape lift relative flex flex-col p-5">
      <p className="hud-label flex items-center justify-between gap-2">
        <span>Dad-joke model · v0.1</span>
        {joke && <span className={joke.pool === "spicy" ? "text-red" : "text-blue"}>{joke.pool}</span>}
      </p>

      <div className="mt-3 min-h-[6.5rem] rounded-lg border-2 border-dashed border-line-strong bg-card-2/60 p-3 font-mono text-sm leading-relaxed" aria-live="polite">
        {phase === "idle" ? (
          <span className="text-muted">&gt; awaiting prompt. press generate…</span>
        ) : (
          <>
            <span className="text-ink">{shown.setup}</span>
            {phase === "think" && <span className="block text-muted">thinking<span className="caret">…</span></span>}
            {(phase === "punch" || phase === "done") && <span className="mt-1 block font-semibold text-blue">{shown.punch}</span>}
            {streaming && phase !== "think" && <span className="caret text-blue">▍</span>}
          </>
        )}
      </div>

      <label className="mt-3 block text-xs text-muted">
        <span className="flex justify-between font-mono"><span>temperature {temp.toFixed(1)}</span><span>{tempLabel}</span></span>
        <input type="range" min="0.2" max="1.5" step="0.1" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="mt-1 w-full accent-[var(--blue)]" />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={generate} disabled={streaming} className="btn btn-primary px-3 py-1.5 text-sm disabled:opacity-70">
          {phase === "idle" ? "▶ Generate" : streaming ? "Generating…" : "↻ Another"}
        </button>
        {phase === "done" && (
          <span className="pop-in flex gap-1">
            <button type="button" onClick={() => rate("laughs")} disabled={rated} className="rounded-md border-2 border-line-strong px-2.5 py-1 text-sm font-medium transition hover:border-ink disabled:opacity-50">haha</button>
            <button type="button" onClick={() => rate("groans")} disabled={rated} className="rounded-md border-2 border-line-strong px-2.5 py-1 text-sm font-medium transition hover:border-ink disabled:opacity-50">groan</button>
          </span>
        )}
      </div>
      <p className="mt-2 font-hand text-lg text-red">{score.laughs} laughs · {score.groans} groans collected</p>
    </article>
  );
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
