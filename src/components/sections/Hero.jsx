import { useEffect, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { profile, projects } from "../../data/content";
import { scrollToSection } from "../../hooks/scrollTo";
import Button from "../ui/Button";
import Photo from "../ui/Photo";

// LEVEL 01 · Street level. Everything a recruiter needs is on this first screen:
// name, roles, one-liner, resume, projects. The pixel city behind is the WorldCanvas.
export default function Hero({ onPlay }) {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative">
      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:py-10">
        <div>
          <StatusStrip />

          <h1 id="hero-title" className="px-title mt-8 text-[clamp(3.4rem,11vw,7.6rem)]">
            {profile.firstName.toUpperCase()}
            <br />
            {profile.lastName.toUpperCase()}
          </h1>

          <DialogueBox />

          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={profile.resume} download icon="↓">Download resume</Button>
            <Button variant="ghost" href="#projects" icon="→" onClick={(e) => { e.preventDefault(); scrollToSection("projects"); }}>
              View projects
            </Button>
            <Button variant="ghost" icon="▶" onClick={onPlay} className="bob">Press start</Button>
          </div>

          <dl className="px-panel mt-10 grid max-w-xl grid-cols-3">
            <Readout label="Class" value={`B.Tech CSE '${profile.education.year.slice(2)}`} />
            <Readout label="Quests" value={`${projects.length} shipped`} />
            <Readout label="Status" value="Open to roles" accent />
          </dl>
        </div>

        <Billboard />
      </div>
    </section>
  );
}

function StatusStrip() {
  const [time, setTime] = useState(() => clock());
  useEffect(() => {
    const id = setInterval(() => setTime(clock()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="px-panel inline-flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 font-pixel text-sm uppercase">
      <span className="flex items-center gap-2 text-accent">
        <span className="pulse-dot h-2.5 w-2.5 bg-accent-fill" /> Player 1 ready
      </span>
      <span className="tabular text-muted" aria-label={`Local time in India ${time}`}>IST {time}</span>
      <span className="text-muted">{profile.location}</span>
    </div>
  );
}

function clock() {
  return new Date().toLocaleTimeString("en-GB", { timeZone: profile.timezone, hour12: false });
}

// RPG-style dialogue box: types out each role, then the tagline sits underneath.
function DialogueBox() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [text, setText] = useState(reduce ? profile.roles[0] : "");
  const [phase, setPhase] = useState("type");

  useEffect(() => {
    const word = profile.roles[i];
    if (reduce) {
      setText(word);
      const id = setTimeout(() => setI((i + 1) % profile.roles.length), 2600);
      return () => clearTimeout(id);
    }
    let id;
    if (phase === "type") {
      if (text.length < word.length) id = setTimeout(() => setText(word.slice(0, text.length + 1)), 55);
      else id = setTimeout(() => setPhase("erase"), 1800);
    } else {
      if (text.length > 0) id = setTimeout(() => setText(text.slice(0, -1)), 28);
      else { setPhase("type"); setI((i + 1) % profile.roles.length); }
    }
    return () => clearTimeout(id);
  }, [text, phase, i, reduce]);

  return (
    <div className="px-panel relative mt-10 max-w-xl px-5 pb-5 pt-4">
      <span className="absolute -top-3.5 left-4 bg-accent-fill px-2 py-0.5 font-pixel text-xs uppercase text-accent-ink">Harshit</span>
      <p className="font-pixel text-xl sm:text-2xl">
        <span className="text-muted">&gt; </span>
        <span className="sr-only">{profile.roles.join(", ")}</span>
        <span aria-hidden="true" className="text-accent">
          {text}
          <span className="caret">▍</span>
        </span>
      </p>
      <p className="mt-3 leading-relaxed text-muted">{profile.tagline}</p>
      <span aria-hidden="true" className="bob absolute bottom-2 right-3 font-pixel text-accent">▼</span>
    </div>
  );
}

function Readout({ label, value, accent }) {
  return (
    <div className="border-r-2 border-line px-4 py-3 last:border-r-0">
      <dt className="font-pixel text-xs uppercase text-muted">{label}</dt>
      <dd className={`mt-0.5 text-sm font-semibold ${accent ? "text-accent" : ""}`}>{value}</dd>
    </div>
  );
}

// The photo as a pixel billboard standing on the rooftops (Nova can sit on top of it).
function Billboard() {
  return (
    <m.figure
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[400px]"
    >
      <div data-perch className="px-panel p-3">
        <div className="mb-2 flex items-center justify-between font-pixel text-xs uppercase">
          <span className="text-accent">Now showing</span>
          <span className="text-muted">harshit.exe</span>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-panel-2">
          <Photo name="hero" priority alt="Harshit Abhinav in a white shirt, standing under trees on campus" sizes="(min-width: 1024px) 400px, 85vw" />
          <Tag className="left-2 top-[30%]" text="optics: required" />
          <Tag className="bottom-3 right-2" text="status: hire-ready" />
        </div>
      </div>
      {/* billboard legs */}
      <div aria-hidden="true" className="flex justify-between px-12">
        <span className="h-10 w-3 bg-[var(--px-edge)]" />
        <span className="h-10 w-3 bg-[var(--px-edge)]" />
      </div>
    </m.figure>
  );
}

function Tag({ text, className }) {
  return (
    <span aria-hidden="true" className={`absolute border-2 border-[var(--px-edge)] bg-accent-fill px-1.5 py-0.5 font-pixel text-[0.7rem] uppercase text-accent-ink ${className}`}>
      {text}
    </span>
  );
}
