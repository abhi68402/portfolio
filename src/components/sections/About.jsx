import { about, profile } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";
import Photo from "../ui/Photo";

// LEVEL 02 · Monsoon lane. Left: a character card. Middle: who I am.
// Right: the off-duty log with hobbies (and a button that calls Nova over).
export default function About() {
  return (
    <SectionFrame id="about" title="Player profile">
      <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.3fr_1fr]">
        <CharacterCard />

        <div data-perch className="px-panel flex flex-col items-center gap-5 px-6 py-8 text-center">
          <p className="font-pixel text-2xl leading-snug sm:text-3xl">{about.lines[0]}</p>
          {about.lines.slice(1).map((line) => (
            <p key={line} className="max-w-lg leading-relaxed text-muted">{line}</p>
          ))}
          <span aria-hidden="true" className="font-pixel text-sm text-accent">— end of transmission —</span>
        </div>

        <OffDutyLog />
      </div>
    </SectionFrame>
  );
}

// RPG-style character sheet with stat bars
function CharacterCard() {
  const stats = [
    ["Build", 92],
    ["Curiosity", 98],
    ["Debugging", 86],
    ["Dog petting", 100],
  ];
  return (
    <article data-perch className="px-panel mx-auto w-full max-w-xs p-4">
      <div className="mb-3 flex items-center justify-between font-pixel text-xs uppercase">
        <span className="text-muted">Character</span>
        <span className="text-accent">LV. {profile.education.year.slice(2)}</span>
      </div>
      <div className="aspect-[4/5] overflow-hidden border-[3px] border-[var(--px-edge)]">
        <Photo name="offduty" alt="Harshit in a black cap and glasses, thinking while looking at his phone" sizes="(min-width: 1024px) 300px, 80vw" />
      </div>
      <p className="mt-3 font-pixel text-lg leading-tight">{profile.name}</p>
      <p className="text-xs text-muted">{profile.education.degree} · {profile.education.school} · {profile.education.year}</p>
      <dl className="mt-3 space-y-1.5">
        {stats.map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <dt className="w-24 shrink-0 font-pixel text-xs uppercase text-muted">{k}</dt>
            <dd className="flex h-2.5 flex-1 border-2 border-line-strong bg-panel-2">
              <span className="sr-only">{v} out of 100</span>
              <span aria-hidden="true" className="h-full bg-accent-fill" style={{ width: `${v}%` }} />
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function OffDutyLog() {
  return (
    <article data-perch className="px-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-pixel text-xs uppercase text-muted">Side quests</h3>
        <button
          type="button"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            window.dispatchEvent(new CustomEvent("mascot", { detail: { type: "call", x: r.left + r.width / 2 } }));
          }}
          className="border-2 border-line-strong px-2 py-0.5 font-pixel text-xs uppercase text-muted transition hover:border-accent hover:text-accent"
        >
          🐾 Call Nova
        </button>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden border-[3px] border-[var(--px-edge)]">
        <Photo name="fun" alt="Harshit crouching under a red umbrella in the rain, petting a street dog" sizes="(min-width: 1024px) 320px, 90vw" />
        <span className="absolute bottom-2 left-2 bg-black/65 px-1.5 py-0.5 font-pixel text-xs uppercase text-white">
          Monsoon patrol
        </span>
      </div>

      <ul className="mt-4 space-y-2.5">
        {about.hobbies.map((h) => (
          <li key={h.label} className="flex items-start gap-3">
            <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center border-2 border-line-strong bg-panel-2 text-sm">{h.icon}</span>
            <span className="text-sm leading-tight">
              {h.label}
              <span className="block text-xs text-muted">{h.note}</span>
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
