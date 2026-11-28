import { useEffect, useRef, useState } from "react";
import { projects } from "../../data/content";
import { scrollToSection } from "../../hooks/scrollTo";
import Photo from "../ui/Photo";

// A pile of taped project snapshots. Click the pile (or Next) and the top card
// slides off to the back, bringing the next project forward at full size.
// Prev goes the other way; the counter and "See it in Projects" follow along.
const FIRST = ["vyu", "clearsight", "nasa-rul", "ecobin"]; // shown first; the rest follow
const picks = projects
  .filter((p) => p.photo)
  .sort((a, b) => (FIRST.indexOf(a.id) + 1 || 99) - (FIRST.indexOf(b.id) + 1 || 99));
// resting rotation / offset per slot in the pile (0 = top)
const REST = [
  { r: -2, x: "0%", y: "1.6rem" },
  { r: 4, x: "-5%", y: "0.9rem" },
  { r: -5, x: "5%", y: "0.4rem" },
  { r: 2, x: "-2%", y: "0rem" },
];
const SHOWN = REST.length;
const ANIM_MS = 320;

export default function ProjectStack() {
  const [top, setTop] = useState(0); // index into picks of the card in front
  const [leaving, setLeaving] = useState(null); // { i, dir } while a card animates away
  const timer = useRef(0);
  const reduce = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (dir) => {
    if (leaving) return;
    const next = (top + dir + picks.length) % picks.length;
    if (reduce) { setTop(next); return; }
    if (dir > 0) {
      // the current top card slides off, then the next one is in front
      setLeaving({ i: top, dir });
      timer.current = setTimeout(() => { setLeaving(null); setTop(next); }, ANIM_MS);
    } else {
      // the previous card comes back from the side onto the top
      setTop(next);
      setLeaving({ i: next, dir });
      timer.current = setTimeout(() => setLeaving(null), 30);
    }
  };

  const current = picks[top];

  return (
    <div className="flex flex-col lg:min-h-0 lg:flex-1">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="hud-label">Project snapshots</h3>
        <span className="hud-label tabular" aria-live="polite">
          {top + 1} / {picks.length}
        </span>
      </div>

      <div className="pstack relative">
        {picks.map((p, i) => {
          const slot = (i - top + picks.length) % picks.length;
          if (slot >= SHOWN) return null;
          const isTop = slot === 0;
          const anim = leaving && leaving.i === i ? (leaving.dir > 0 ? "leaving" : "leaving-back") : "";
          return (
            <button
              key={p.id}
              type="button"
              tabIndex={isTop ? 0 : -1}
              aria-hidden={isTop ? undefined : true}
              onClick={() => go(1)}
              aria-label={`${p.title}. Show the next project`}
              className={`card pstack-card ${isTop ? "tape" : ""} ${i % 2 ? "tape-blue" : ""} ${anim}`}
              style={{ "--r": `${REST[slot].r}deg`, "--x": REST[slot].x, "--y": REST[slot].y, zIndex: 10 - slot }}
            >
              <div className="aspect-[4/3] overflow-hidden rounded-sm bg-card-2">
                <Photo name={p.photo} alt="" width={800} height={600} sizes="(min-width: 1024px) 460px, 86vw" />
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="font-hand text-2xl leading-tight">{p.title}</span>
                <span className="hud-label">{p.year}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="Previous project" className="min-h-11 rounded-md border-2 border-line-strong px-3 text-sm font-semibold text-muted transition hover:border-ink hover:text-ink">
            ← Prev
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next project" className="min-h-11 rounded-md border-2 border-ink bg-hl px-3 text-sm font-semibold text-ink shadow-[2px_2px_0_var(--ink)] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
            Next →
          </button>
        </div>
        <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection("projects"); }} className="squiggle text-sm font-medium text-blue">
          See {current.title} in Projects
        </a>
      </div>
    </div>
  );
}
