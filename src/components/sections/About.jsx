import { useState } from "react";
import { about, profile } from "../../data/content";
import { safeGet, safeSet } from "../../hooks/storage";
import SectionFrame from "../layout/SectionFrame";
import MarginNote from "../notebook/MarginNote";
import Photo from "../ui/Photo";
import ProjectStack from "../projects/ProjectStack";

// LOG ENTRY 02 · Crew profile. Left: who I am (readable, plain text).
// Under it: a pile of project snapshots. Right: the dog photo as a pettable card, plus side quests (hobbies).
export default function About() {
  return (
    <SectionFrame id="about" title="Crew profile" doodle="moon">
      <div className="grid items-stretch gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col gap-8">
        <div className="card p-6 sm:p-8">
          <p className="font-serif text-2xl font-medium leading-snug sm:text-[1.75rem]">{about.lines[0]}</p>
          <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted">
            {about.lines.slice(1).map((line) => <p key={line}>{line}</p>)}
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-dashed border-line-strong pt-5 text-sm sm:grid-cols-3">
            <Fact k="Degree" v="B.Tech CSE" />
            <Fact k="University" v={profile.education.school} />
            <Fact k="Graduating" v={profile.education.year} />
          </dl>
        </div>
        <ProjectStack />
        </div>

        <div className="space-y-8">
          <PetTheDog />
          <ul className="card tape tilt-r space-y-3 p-5" aria-label="Side quests">
            <li className="hud-label">Side quests</li>
            {about.hobbies.map((h) => (
              <li key={h.label} className="flex items-start gap-3">
                <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-card-2 text-lg">{h.icon}</span>
                <span className="leading-tight">
                  {h.label}
                  <span className="block text-sm text-muted">{h.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionFrame>
  );
}

function Fact({ k, v }) {
  return (
    <div>
      <dt className="hud-label">{k}</dt>
      <dd className="mt-0.5 font-medium">{v}</dd>
    </div>
  );
}

// Click the dog photo: hearts float up and a pet counter goes up.
function PetTheDog() {
  const [pets, setPets] = useState(() => Number(safeGet("pets", 0)) || 0);
  const [hearts, setHearts] = useState([]);
  const pet = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX || r.left + r.width / 2) - r.left, y = (e.clientY || r.top + r.height / 2) - r.top;
    const id = Math.random();
    setHearts((h) => [...h.slice(-6), { id, x, y }]);
    setTimeout(() => setHearts((h) => h.filter((q) => q.id !== id)), 1100);
    setPets((c) => { safeSet("pets", String(c + 1)); return c + 1; });
  };
  return (
    <figure className="card relative rotate-1 p-3">
      <button type="button" onClick={pet} aria-label="Pet the dog" className="relative block w-full cursor-pointer overflow-hidden rounded-md">
        <div className="aspect-[4/5]">
          <Photo name="fun" alt="Harshit crouching under a red umbrella in the rain, petting a street dog" sizes="(min-width: 1024px) 400px, 90vw" />
        </div>
        {hearts.map((h) => (
          <span key={h.id} aria-hidden="true" className="float-up pointer-events-none absolute text-2xl" style={{ left: h.x - 12, top: h.y - 16 }}>❤️</span>
        ))}
      </button>
      <figcaption className="mt-3 flex items-center justify-between gap-3">
        <span className="font-hand text-2xl">monsoon patrol</span>
        <span className="text-sm text-muted" aria-live="polite">{pets ? `pets given: ${pets}` : "tap to pet 🐾"}</span>
      </figcaption>
      <MarginNote arrow="down" className="absolute -top-12 right-6">good boy!</MarginNote>
    </figure>
  );
}
