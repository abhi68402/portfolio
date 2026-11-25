import { useEffect, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { profile, projects } from "../../data/content";
import { scrollToSection } from "../../hooks/scrollTo";
import StarfieldCanvas from "../hero/StarfieldCanvas";
import HudCorners from "../ui/HudCorners";
import Button from "../ui/Button";
import Photo from "../ui/Photo";

// MOD 01 · the first screen. Everything a recruiter needs is here without scrolling:
// name, roles, one-liner, resume, projects, and the (optional) game.
export default function Hero({ onPlay }) {
  return (
    <section id="hero" aria-labelledby="hero-title" className="bg-grid relative overflow-hidden border-b border-line">
      <StarfieldCanvas />
      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-10">
        <div>
          <StatusStrip />

          <h1 id="hero-title" className="mt-8 text-[clamp(3.2rem,10vw,6.75rem)] font-semibold leading-[0.92] tracking-[-0.045em]">
            {profile.firstName}
            <br />
            <span className="text-transparent [-webkit-text-stroke:1.5px_var(--text)]">{profile.lastName}</span>
            <span className="text-accent">.</span>
          </h1>

          <RoleReadout />

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{profile.tagline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={profile.resume} download icon="↓">Download Resume</Button>
            <Button variant="ghost" href="#projects" icon="→" onClick={(e) => { e.preventDefault(); scrollToSection("projects"); }}>
              View Projects
            </Button>
            <Button variant="ghost" icon="▶" onClick={onPlay}>Play a Game</Button>
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-3 border-y border-line">
            <Readout label="Edu" value={`B.Tech CSE · ${profile.education.school.split(" ")[0]} '${profile.education.year.slice(2)}`} />
            <Readout label="Missions" value={`${projects.length} logged`} />
            <Readout label="Status" value="Open to roles" accent />
          </dl>
        </div>

        <HeroPhoto />
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
    <div className="hud-label flex flex-wrap items-center gap-x-5 gap-y-2">
      <span className="flex items-center gap-2 text-accent">
        <span className="pulse-dot h-2 w-2 rounded-full bg-accent-fill" /> SYS: Online
      </span>
      <span className="tabular" aria-label={`Local time in India ${time}`}>IST {time}</span>
      <span>LOC ▸ {profile.location}</span>
    </div>
  );
}

function clock() {
  return new Date().toLocaleTimeString("en-GB", { timeZone: profile.timezone, hour12: false });
}

// Types out each role, pauses, erases, moves to the next.
// With reduced motion it simply swaps the words every few seconds.
function RoleReadout() {
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
    <p className="mt-6 font-mono text-base sm:text-lg">
      <span className="text-muted">ROLE ▸ </span>
      {/* Screen readers get the full list once instead of a flickering word */}
      <span className="sr-only">{profile.roles.join(", ")}</span>
      <span aria-hidden="true" className="text-accent">
        {text}
        <span className="caret">▍</span>
      </span>
    </p>
  );
}

function Readout({ label, value, accent }) {
  return (
    <div className="border-r border-line py-3 pr-3 last:border-r-0 [&:not(:first-child)]:pl-3">
      <dt className="hud-label text-[0.62rem]">{label}</dt>
      <dd className={`mt-1 text-sm font-medium ${accent ? "text-accent" : ""}`}>{value}</dd>
    </div>
  );
}

function HeroPhoto() {
  return (
    <m.figure
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[420px] p-3"
    >
      <HudCorners size={22} />
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-line bg-panel">
        <Photo name="hero" priority alt="Harshit Abhinav in a white shirt, standing under trees on campus" sizes="(min-width: 1024px) 420px, 80vw" />
        <div className="scan-line pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-[var(--accent-soft)] to-transparent" aria-hidden="true" />
        {/* crosshair ticks in the centre of each edge */}
        <span aria-hidden="true" className="absolute left-1/2 top-0 h-3 w-px bg-white/60" />
        <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-3 w-px bg-white/60" />
        <span aria-hidden="true" className="absolute left-0 top-1/2 h-px w-3 bg-white/60" />
        <span aria-hidden="true" className="absolute right-0 top-1/2 h-px w-3 bg-white/60" />
        <span aria-hidden="true" className="absolute left-3 top-3 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[0.62rem] tracking-widest text-white/85">
          FIG.01 · REC ●
        </span>
      </div>

      {/* Annotations with leader lines, like a labelled diagram */}
      <Annotation className="left-[-0.25rem] top-[30%] xl:left-[-3.5rem]" text="optics: required" />
      <Annotation className="right-[-0.25rem] top-[72%] xl:right-[-3rem]" text="status: hire-ready" right />

      <figcaption className="hud-label mt-3 flex justify-between text-[0.62rem]">
        <span>Subject · H. Abhinav</span>
        <span className="tabular">ISO 100 · ƒ1.8</span>
      </figcaption>
    </m.figure>
  );
}

function Annotation({ text, className, right }) {
  return (
    <span aria-hidden="true" className={`absolute flex items-center gap-1.5 ${right ? "flex-row-reverse" : ""} ${className}`}>
      <span className="rounded border border-line-strong bg-bg/85 px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-widest text-text backdrop-blur">
        {text}
      </span>
      <span className="h-px w-8 bg-accent-fill" />
      <span className="h-1.5 w-1.5 rounded-full bg-accent-fill" />
    </span>
  );
}
