import { useRef, useState } from "react";
import { useInView } from "motion/react";
import { skillGroups } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";
import MarginNote from "../notebook/MarginNote";
import GaugeBar from "../skills/GaugeBar";
import StarChart from "../skills/StarChart";

// LOG ENTRY 03 · Star chart. Skills drawn as constellations (hover one to
// light it up), with the plain, scannable list beside it.
export default function Skills() {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <SectionFrame id="skills" title="Star chart" kicker="Every skill is a star: bigger means stronger. Hover a constellation, or a group in the list, to light it up." doodle="telescope">
      <div ref={ref} className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="card relative p-4 sm:p-6">
          <StarChart active={active} onActive={setActive} />
          <MarginNote arrow="down" className="absolute -top-10 right-6 hidden sm:inline-flex">try hovering</MarginNote>
        </div>

        <div className="card grid gap-x-6 gap-y-6 p-5 sm:grid-cols-2">
          {skillGroups.map((g) => (
            <div
              key={g.id}
              tabIndex={0}
              onMouseEnter={() => setActive(g.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(g.id)}
              onBlur={() => setActive(null)}
              className={`rounded-lg p-2 transition ${active === g.id ? "bg-hl/40" : ""}`}
            >
              <h3 className="mb-2 font-serif text-lg font-semibold">{g.name}</h3>
              <div className="space-y-2">
                {g.skills.map((s) => <GaugeBar key={s.name} {...s} on={inView} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}
