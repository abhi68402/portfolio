import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { learning, profile, projects, skillGroups } from "../../data/content";
import { proof } from "../../data/proof";
import { scrollToSection } from "../../hooks/scrollTo";
import SectionFrame from "../layout/SectionFrame";
import MarginNote from "../notebook/MarginNote";

// LOG ENTRY 03 · Toolkit. Every skill, grouped, as plain text a recruiter can
// scan. Skills with a receipt are clickable: the card on the right shows the
// project that proves it and how it was used (data in src/data/proof.js).
const SITE = { id: "site", title: "This portfolio", github: `${profile.links.github}/portfolio` };
const byId = Object.fromEntries(projects.map((p) => [p.id, p]));
const receiptsFor = (skill) => (proof[skill] || []).map((r) => ({ ...r, p: r.project === "site" ? SITE : byId[r.project] })).filter((r) => r.p);

export default function Skills() {
  const [skill, setSkill] = useState("PyTorch");
  const receipts = receiptsFor(skill);

  return (
    <SectionFrame id="skills" title="Toolkit" kicker="Every skill comes with receipts. Click one to see the project where I used it." doodle="satellite">
      <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr] [&>*]:min-w-0">
        {/* all skills, grouped: label left, chips right */}
        <div className="card relative p-5 sm:p-7">
          <dl className="divide-y divide-dashed divide-line-strong">
            {skillGroups.map((g) => (
              <div key={g.id} className="grid gap-2 py-4 first:pt-1 last:pb-1 md:grid-cols-[10rem_1fr] md:gap-6">
                <dt className={`font-serif text-lg font-semibold leading-tight md:pt-1 ${g.core ? "text-blue" : ""}`}>
                  {g.name}
                  {g.core && <span className="hud-label mt-1 block !text-[0.68rem] !text-muted">Core focus</span>}
                </dt>
                <dd>
                  <ul className="flex flex-wrap gap-2">
                    {g.skills.map((s) => {
                      const base = "rounded-full border px-3 py-1 text-sm leading-6";
                      if (!proof[s.name]) return <li key={s.name} className={`${base} border-line-strong bg-card-2 text-ink`}>{s.name}</li>;
                      const on = skill === s.name;
                      return (
                        <li key={s.name}>
                          <button
                            type="button"
                            aria-pressed={on}
                            onClick={() => setSkill(s.name)}
                            className={`${base} font-medium transition-[transform,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-0.5 ${
                              on
                                ? "border-ink bg-hl text-ink shadow-[2px_2px_0_var(--ink)]"
                                : g.core
                                  ? "border-blue/50 bg-blue/10 text-ink hover:border-blue"
                                  : "border-line-strong bg-card-2 text-ink hover:border-ink"
                            }`}
                          >
                            {s.name}
                            <span aria-hidden="true" className="ml-1 text-xs text-blue">↗</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
          <MarginNote arrow="down" className="absolute -top-12 right-6 hidden sm:inline-flex">click a ↗ skill</MarginNote>
        </div>

        {/* receipts for the chosen skill */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="card tape p-5 sm:p-6" aria-live="polite">
            <p className="hud-label">Receipt</p>
            <h3 className="mt-1 font-serif text-2xl font-semibold">{skill}</h3>
            <AnimatePresence mode="popLayout" initial={false}>
              <m.ul
                key={skill}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="mt-4 space-y-4"
              >
                {receipts.map(({ p, how }) => (
                  <li key={p.id} className="border-l-2 border-blue pl-3">
                    <p className="font-semibold">
                      {p.id === "site" ? (
                        <a href={p.github} target="_blank" rel="noreferrer" className="squiggle text-ink hover:text-blue">{p.title} ↗</a>
                      ) : (
                        <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection("projects"); }} className="squiggle text-ink hover:text-blue">{p.title} →</a>
                      )}
                    </p>
                    <p className="text-sm text-muted">{how}</p>
                  </li>
                ))}
              </m.ul>
            </AnimatePresence>
          </div>

          <div className="card tilt-r p-5">
            <p className="hud-label">Currently learning</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {learning.map((l) => (
                <li key={l} className="rounded-lg border-2 border-dashed border-blue/60 px-3 py-1 text-sm text-blue">{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
