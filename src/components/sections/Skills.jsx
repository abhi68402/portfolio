import { useRef, useState } from "react";
import { useInView } from "motion/react";
import { skillGroups } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";
import RadarChart from "../skills/RadarChart";
import GaugeBar from "../skills/GaugeBar";

// MOD 03 · Systems Check. Radar chart for the big picture,
// and every skill listed with a gauge so nothing needs a click to find.
export default function Skills() {
  const [highlight, setHighlight] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <SectionFrame id="skills" title="Skill tree" kicker="Six skill trees, levelled up through real projects. Hover or focus one to light it up on the radar.">
      <div ref={ref} className="grid gap-10 lg:grid-cols-[360px_1fr]">
        <div data-perch className="px-panel relative self-start p-5 lg:sticky lg:top-28">
          <div className="flex items-center justify-between">
            <span className="hud-label text-[0.62rem]">Subsystem radar</span>
            <span className="hud-label flex items-center gap-1.5 text-[0.62rem] text-accent">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent-fill" /> All nominal
            </span>
          </div>
          <RadarChart groups={skillGroups} highlight={highlight} />
          <p className="hud-label text-center text-[0.6rem]">Rings: 25 · 50 · 75 · 100</p>
        </div>

        <ul className="grid gap-x-6 gap-y-20 sm:grid-cols-2">
          {skillGroups.map((g, idx) => (
            <li
              key={g.id}
              tabIndex={0}
              onMouseEnter={() => setHighlight(g.id)}
              onMouseLeave={() => setHighlight(null)}
              onFocus={() => setHighlight(g.id)}
              onBlur={() => setHighlight(null)}
              data-perch
              className={`px-panel p-4 transition ${highlight === g.id ? "px-panel-accent" : ""}`}
            >
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="font-pixel text-lg">
                  <span className="mr-2 font-mono text-xs text-muted">S{String(idx + 1).padStart(2, "0")}</span>
                  {g.name}
                </h3>
                <span className="hud-label text-[0.62rem]">{g.skills.length} modules</span>
              </div>
              <div className="space-y-3">
                {g.skills.map((s) => <GaugeBar key={s.name} {...s} on={inView} />)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SectionFrame>
  );
}
