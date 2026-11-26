import { useRef } from "react";
import { useInView } from "motion/react";
import { skillGroups } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";
import BallPit from "../physics/BallPit";
import GaugeBar from "../skills/GaugeBar";

// STAGE 03 · Skill tree. Left: a physics ball pit of skills to play with.
// Right: the plain, scannable list with levels (what recruiters actually read).
export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <SectionFrame id="skills" title="Skill tree" kicker="Every ball is a skill: bigger means stronger. Grab one and throw it. The full list is on the right.">
      <div ref={ref} className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="neon-panel">
          <BallPit />
        </div>

        <div tabIndex={0} aria-label="Skill list with levels" className="neon-panel grid gap-x-6 gap-y-6 p-5 sm:grid-cols-2 lg:max-h-[440px] lg:overflow-y-auto">
          {skillGroups.map((g) => (
            <div key={g.id}>
              <h3 className="mb-3 font-display text-base text-cyan">{g.name}</h3>
              <div className="space-y-2.5">
                {g.skills.map((s) => <GaugeBar key={s.name} {...s} on={inView} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}
