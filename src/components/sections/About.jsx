import { about, profile } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";
import HudCorners from "../ui/HudCorners";
import Photo from "../ui/Photo";

// MOD 02 · Crew Dossier. Left: ID-card style photo. Middle: who I am.
// Right: the "off-duty log" with hobbies.
export default function About() {
  return (
    <SectionFrame id="about" title="The person behind the console">
      <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.3fr_1fr]">
        <DossierCard />

        <div className="flex flex-col items-center gap-5 text-center lg:pt-6">
          <p className="text-2xl font-medium leading-snug tracking-tight sm:text-[1.7rem]">{about.lines[0]}</p>
          {about.lines.slice(1).map((line) => (
            <p key={line} className="max-w-lg leading-relaxed text-muted">{line}</p>
          ))}
          <span aria-hidden="true" className="hud-label mt-2 text-accent">— end of transmission —</span>
        </div>

        <OffDutyLog />
      </div>
    </SectionFrame>
  );
}

function DossierCard() {
  const rows = [
    ["Name", profile.name],
    ["Degree", "B.Tech CSE"],
    ["Base", profile.education.school],
    ["Class of", profile.education.year],
    ["Clearance", "Full stack"],
  ];
  return (
    <article className="relative mx-auto w-full max-w-xs rounded-lg border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="hud-label text-[0.62rem]">Subject file</span>
        <span className="hud-label text-[0.62rem] text-accent">#HA-{profile.education.year}</span>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm p-2">
        <HudCorners size={12} />
        <div className="h-full overflow-hidden rounded-sm">
          <Photo name="about" alt="Harshit Abhinav in a pinstripe suit and sunglasses, seated in an auditorium" sizes="(min-width: 1024px) 300px, 80vw" />
        </div>
      </div>
      <dl className="mt-4 divide-y divide-line font-mono text-xs">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-1.5">
            <dt className="uppercase tracking-widest text-muted">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function OffDutyLog() {
  return (
    <article className="rounded-lg border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="hud-label text-[0.62rem]">Beyond code · off-duty log</h3>
        <button
          type="button"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            window.dispatchEvent(new CustomEvent("mascot", { detail: { type: "call", x: r.left + r.width / 2 } }));
          }}
          className="rounded border border-line-strong px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-widest text-muted transition hover:border-accent hover:text-accent"
        >
          🐾 Say hi to Nova
        </button>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-line">
        <Photo name="fun" alt="Harshit crouching under a red umbrella in the rain, petting a street dog" sizes="(min-width: 1024px) 320px, 90vw" />
        <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-white/90">
          Monsoon patrol
        </span>
      </div>

      <ul className="mt-4 space-y-2.5">
        {about.hobbies.map((h) => (
          <li key={h.label} className="flex items-start gap-3">
            <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded border border-line bg-panel-2 text-sm">{h.icon}</span>
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
