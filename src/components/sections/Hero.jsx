import { useEffect, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { profile, projects } from "../../data/content";
import { scrollToSection } from "../../hooks/scrollTo";
import KineticName from "../physics/KineticName";
import Button from "../ui/Button";
import Photo from "../ui/Photo";

// STAGE 01 · Insert coin. Everything a recruiter needs is on this first screen:
// name, roles, one-liner, resume, projects. The name letters can be flung around.
export default function Hero({ onPlay }) {
  return (
    <section id="hero" aria-labelledby="hero-name" className="relative">
      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:py-10">
        <div>
          <Greeting />

          <div id="hero-name" className="mt-6">
            <KineticName
              lines={[profile.firstName.toUpperCase(), profile.lastName.toUpperCase()]}
              lineClassNames={["neon-mag", "neon-cyan"]}
              className="font-display text-[clamp(3rem,10.5vw,7.2rem)] leading-[0.92]"
            />
          </div>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.25em] text-muted">↑ go on, grab a letter</p>

          <div className="neon-panel mt-8 max-w-xl px-5 py-4">
            <RoleLine />
            <p className="mt-2 text-lg leading-relaxed text-muted">{profile.tagline}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={profile.resume} download icon="↓">Download resume</Button>
            <Button variant="ghost" href="#projects" icon="→" onClick={(e) => { e.preventDefault(); scrollToSection("projects"); }}>
              View projects
            </Button>
            <Button variant="ghost" icon="👾" onClick={onPlay}>Bug blitz</Button>
          </div>

          <dl className="neon-panel mt-10 grid max-w-xl grid-cols-3 divide-x divide-line">
            <Readout label="Class" value={`B.Tech CSE '${profile.education.year.slice(2)}`} />
            <Readout label="Projects" value={`${projects.length} shipped`} />
            <Readout label="Status" value="Open to roles" hot />
          </dl>
        </div>

        <Cabinet />
      </div>
    </section>
  );
}

// Greets the visitor based on their local time
function Greeting() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);
  const h = now.getHours();
  const [hello, emoji] = h < 5 ? ["Up late, night owl", "🦉"] : h < 12 ? ["Good morning", "☀️"] : h < 17 ? ["Good afternoon", "🌤️"] : h < 21 ? ["Good evening", "🌆"] : ["Hey there, night owl", "🌙"];
  return (
    <p className="neon-panel inline-flex items-center gap-3 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em]">
      <span className="pulse-dot h-2 w-2 rounded-full bg-[var(--cyan)] shadow-[0_0_8px_var(--cyan)]" />
      <span><span aria-hidden="true">{emoji} </span>{hello}, player 1</span>
    </p>
  );
}

// Types out each role, then erases it and moves on
function RoleLine() {
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
    <p className="font-display text-2xl sm:text-3xl">
      <span className="text-muted">&gt; </span>
      <span className="sr-only">{profile.roles.join(", ")}</span>
      <span aria-hidden="true" className="neon-cyan">
        {text}
        <span className="caret">_</span>
      </span>
    </p>
  );
}

function Readout({ label, value, hot }) {
  return (
    <div className="px-4 py-3">
      <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">{label}</dt>
      <dd className={`mt-1 text-sm font-semibold ${hot ? "neon-mag" : ""}`}>{value}</dd>
    </div>
  );
}

// The photo on an arcade-cabinet "screen" with a marquee on top
function Cabinet() {
  return (
    <m.figure
      initial={{ opacity: 0, y: 30, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[400px]"
    >
      <div className="neon-panel neon-panel-hot p-3">
        <div className="mb-3 rounded-lg bg-[#ff2bd6] px-3 py-1.5 text-center font-display text-sm uppercase text-[#14041f]">
          ★ Player 1 · Harshit ★
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-panel-2">
          <Photo name="hero" priority alt="Harshit Abhinav in a white shirt, standing under trees on campus" sizes="(min-width: 1024px) 400px, 85vw" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.12)_0_1px,transparent_1px_3px)]" />
          <span aria-hidden="true" className="absolute left-2 top-2 rounded-md bg-black/65 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-[#22e6ff]">HP ████████ 100</span>
          <span aria-hidden="true" className="absolute bottom-2 right-2 rounded-md bg-[#ff2bd6] px-2 py-0.5 font-display text-[0.7rem] uppercase text-[#14041f]">Hire-ready</span>
        </div>
        <div className="mt-3 flex items-center justify-between px-1" aria-hidden="true">
          <span className="flex gap-2">
            <span className="h-4 w-4 rounded-full bg-[#ff2bd6] shadow-[0_0_10px_#ff2bd6]" />
            <span className="h-4 w-4 rounded-full bg-[#22e6ff] shadow-[0_0_10px_#22e6ff]" />
          </span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.25em] text-muted">Insert coin</span>
        </div>
      </div>
    </m.figure>
  );
}
