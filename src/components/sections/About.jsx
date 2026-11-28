import { useState } from "react";
import { about, profile, rightNow } from "../../data/content";
import { safeGet, safeSet } from "../../hooks/storage";
import SectionFrame from "../layout/SectionFrame";
import Highlight from "../notebook/Highlight";
import MarginNote from "../notebook/MarginNote";
import Photo from "../ui/Photo";
import ProjectStack from "../projects/ProjectStack";

// LOG ENTRY 02 · Crew profile. Left: "Graduated and open to work", who I am and
// the key facts, then a pile of project snapshots. Right: the dog photo, plus side quests.
export default function About() {
  return (
    <SectionFrame id="about" title="Crew profile" doodle="moon">
      {/* a 2x2 grid so each row's cards share top and bottom edges:
          intro | dog photo, then project pile | side quests */}
      <div className="grid items-stretch gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div className="card flex flex-col p-6 sm:p-8">
          <p className="hud-label flex items-center gap-2">
            <span className="pulse-dot h-2 w-2 rounded-full bg-blue" /> Right now
          </p>
          <p className="mt-2 font-serif text-3xl font-semibold leading-tight sm:text-[2.1rem]">
            <Highlight>Graduated and open to work</Highlight>
          </p>
          <p className="mt-2 text-base text-muted">Looking for {rightNow.lookingFor.charAt(0).toLowerCase() + rightNow.lookingFor.slice(1)}.</p>
          <p className="mt-6 border-t border-dashed border-line-strong pt-6 font-serif text-xl font-medium leading-snug sm:text-2xl">{about.lines[0]}</p>
          <div className="mb-6 mt-5 space-y-4 text-lg leading-relaxed text-muted">
            {about.lines.slice(1).map((line) => <p key={line}>{line}</p>)}
          </div>
          {/* mt-auto pins the facts to the bottom when the row is taller than the text */}
          <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-dashed border-line-strong pt-5 text-sm sm:grid-cols-4">
            <Fact k="Degree" v="B.Tech CSE" />
            <Fact k="University" v={profile.education.school} />
            <Fact k="Graduated" v={profile.education.year} />
            <Fact k="CGPA" v={profile.education.cgpa} />
          </dl>
        </div>

        <PetTheDog />

        <ProjectStack />

        <ul className="card tape flex flex-col p-5 sm:p-6" aria-label="Side quests">
          <li className="hud-label">Side quests</li>
          {about.hobbies.map((h) => (
            <li key={h.label} className="flex flex-1 items-center gap-4 border-b border-dashed border-line py-3 last:border-0">
              <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-card-2 text-xl">{h.icon}</span>
              <span className="leading-tight">
                <span className="font-medium">{h.label}</span>
                <span className="mt-0.5 block text-sm text-muted">{h.note}</span>
              </span>
            </li>
          ))}
        </ul>
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
    <figure className="card relative flex flex-col p-3">
      <button type="button" onClick={pet} aria-label="Pet the dog" className="relative block w-full flex-1 cursor-pointer overflow-hidden rounded-md">
        <div className="aspect-[4/5] lg:aspect-auto lg:h-full">
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
