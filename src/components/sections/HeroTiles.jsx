import { useState } from "react";
import { nowBuilding, quiz } from "../../data/content";
import { safeGet, safeSet } from "../../hooks/storage";
import Sketch from "../notebook/Sketch";

// Three small toys under the hero: what I'm building now, a one-question quiz,
// and a wave button. Light fun; none of them hide any information.
export default function HeroTiles() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-8 sm:px-6 md:grid-cols-3">
      <h2 className="sr-only">At a glance</h2>
      <NowBuilding />
      <Quiz />
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

function Quiz() {
  const [picked, setPicked] = useState(null);
  const right = picked === quiz.answer;
  return (
    <article className="card tape-blue tape lift relative p-5">
      <p className="hud-label">Pop quiz</p>
      <h3 className="mt-2 font-serif text-xl font-semibold leading-snug">{quiz.question}</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {quiz.options.map((o, i) => {
          const state = picked == null ? "" : i === quiz.answer ? "border-blue bg-blue/10 text-blue" : i === picked ? "border-red text-red line-through" : "opacity-60";
          return (
            <button
              key={o}
              type="button"
              onClick={() => setPicked(i)}
              disabled={picked != null}
              className={`rounded-lg border-2 border-line px-2 py-2 text-left text-sm font-medium transition hover:border-blue ${state}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      <p className="mt-3 min-h-[1.5rem] text-sm" aria-live="polite">
        {picked != null && (
          <span className="pop-in inline-block">
            <span className="font-hand text-xl text-red">{right ? "Correct! ★ " : "Close! "}</span>
            {quiz.reveal}
          </span>
        )}
      </p>
      {picked != null && (
        <button type="button" onClick={() => setPicked(null)} className="squiggle text-sm text-blue">try again</button>
      )}
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
