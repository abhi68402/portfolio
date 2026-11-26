import { about, profile } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";
import Photo from "../ui/Photo";

// STAGE 02 · Player 1. Left: a player-select card. Middle: who I am.
// Right: side quests (hobbies) with the monsoon photo.
export default function About() {
  return (
    <SectionFrame id="about" title="Player profile">
      <div className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.3fr_1fr]">
        <PlayerCard />

        <div className="neon-panel flex flex-col items-center gap-5 px-6 py-8 text-center">
          <p className="font-display text-2xl leading-snug sm:text-[1.7rem]" data-chewable>{about.lines[0]}</p>
          {about.lines.slice(1).map((line) => (
            <p key={line} className="max-w-lg leading-relaxed text-muted">{line}</p>
          ))}
          <span aria-hidden="true" className="neon-cyan font-mono text-xs uppercase tracking-[0.3em]">— press start to continue —</span>
        </div>

        <SideQuests />
      </div>
    </SectionFrame>
  );
}

// "Player select" card: duotone photo + joke stat bars
function PlayerCard() {
  const stats = [
    ["Build", 92],
    ["Curiosity", 98],
    ["Debugging", 86],
    ["Dog petting", 100],
  ];
  return (
    <article className="neon-panel neon-panel-hot mx-auto w-full max-w-xs p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em]">
        <span className="text-muted">Player select</span>
        <span className="neon-mag">LV {profile.education.year.slice(2)}</span>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
        <div className="h-full contrast-125 grayscale">
          <Photo name="hero" alt="Harshit Abhinav, duotone portrait" sizes="(min-width: 1024px) 300px, 80vw" />
        </div>
        {/* neon duotone: magenta in the shadows, cyan in the highlights */}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(160deg,#ff2bd6,#3b0f5c_55%,#22e6ff)] mix-blend-color" />
        <div aria-hidden="true" className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.18)_0_1px,transparent_1px_3px)]" />
        <span aria-hidden="true" className="absolute bottom-2 left-2 font-display text-sm text-white drop-shadow-[0_0_6px_#ff2bd6]">P1</span>
      </div>
      <p className="mt-3 font-display text-lg leading-tight">{profile.name}</p>
      <p className="text-xs text-muted">{profile.education.degree} · {profile.education.school} · {profile.education.year}</p>
      <dl className="mt-3 space-y-1.5">
        {stats.map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <dt className="w-24 shrink-0 font-mono text-[0.68rem] uppercase tracking-wider text-muted">{k}</dt>
            <dd className="h-2 flex-1 overflow-hidden rounded-full bg-panel-2">
              <span className="sr-only">{v} out of 100</span>
              <span aria-hidden="true" className="block h-full rounded-full bg-[linear-gradient(90deg,#22e6ff,#ff2bd6)]" style={{ width: `${v}%` }} />
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function SideQuests() {
  return (
    <article className="neon-panel p-4">
      <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">Side quests</h3>
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
        <Photo name="fun" alt="Harshit crouching under a red umbrella in the rain, petting a street dog" sizes="(min-width: 1024px) 320px, 90vw" />
        <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-white">Monsoon patrol</span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {about.hobbies.map((h) => (
          <li key={h.label} className="flex items-start gap-3">
            <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line-strong bg-panel-2 text-sm">{h.icon}</span>
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
