import { useState } from "react";
import { projects } from "../../data/content";
import { scrollToSection } from "../../hooks/scrollTo";
import Photo from "../ui/Photo";

// A pile of taped project snapshots. Four sit on the pile at a time; "Shuffle"
// cycles through every project with a photo. The top card opens the Projects
// section; any other card comes to the front first. Hover or focus fans them out.
const FIRST = ["vyu", "clearsight", "nasa-rul", "ecobin"]; // shown first; the rest follow
const picks = projects
  .filter((p) => p.photo)
  .sort((a, b) => (FIRST.indexOf(a.id) + 1 || 99) - (FIRST.indexOf(b.id) + 1 || 99));
const SHOWN = 4;
// resting rotation / offset per slot (0 = top of the pile), then the fanned-out version
const REST = [{ r: -2, x: "0%", y: "2.4rem" }, { r: 5, x: "-9%", y: "1rem" }, { r: -6, x: "9%", y: "0.4rem" }, { r: 3, x: "-3%", y: "0rem" }];
// fanned out: four cards side by side, kept inside the column (fc = centre as % of the pile's width)
const FAN = [{ r: -2, c: "40%", y: "1.6rem" }, { r: -4, c: "20%", y: "2.4rem" }, { r: 3, c: "60%", y: "2rem" }, { r: 4, c: "80%", y: "2.6rem" }];

export default function ProjectStack() {
  const [order, setOrder] = useState(() => picks.map((_, i) => i));
  const front = (i) => setOrder((o) => [i, ...o.filter((x) => x !== i)]);
  const shuffle = () => setOrder((o) => [...o.slice(1), o[0]]);

  return (
    <div className="flex flex-col lg:min-h-0 lg:flex-1">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="hud-label">Project snapshots</h3>
        <button type="button" onClick={shuffle} className="squiggle min-h-11 px-1 text-sm font-medium text-blue">Shuffle the pile</button>
      </div>
      <div className="pstack relative">
        {picks.map((p, i) => {
          const slot = order.indexOf(i);
          if (slot >= SHOWN) return null;
          const top = slot === 0;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => (top ? scrollToSection("projects") : front(i))}
              aria-label={top ? `${p.title}: go to projects` : `Bring ${p.title} to the front`}
              className={`card pstack-card ${top ? "tape" : ""} ${i % 2 ? "tape-blue" : ""}`}
              style={{ "--r": `${REST[slot].r}deg`, "--x": REST[slot].x, "--y": REST[slot].y, "--fr": `${FAN[slot].r}deg`, "--fc": FAN[slot].c, "--fy": FAN[slot].y, zIndex: 10 - slot }}
            >
              <div className="aspect-[4/3] overflow-hidden rounded-sm bg-card-2">
                <Photo name={p.photo} alt="" width={800} height={600} sizes="(min-width: 1024px) 300px, 60vw" />
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="font-hand text-2xl leading-tight">{p.title}</span>
                <span className="hud-label">{p.year}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
