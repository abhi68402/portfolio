import { useEffect, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { profile } from "../../data/content";
import { scrollToSection } from "../../hooks/scrollTo";
import Highlight from "../notebook/Highlight";
import MarginNote from "../notebook/MarginNote";
import Sketch from "../notebook/Sketch";
import Button from "../ui/Button";
import Photo from "../ui/Photo";
import HeroTiles from "./HeroTiles";

// LOG ENTRY 01 · Mission brief. Everything a recruiter needs is on this first
// screen: name, roles, one-liner, resume, projects. Then three small toys.
export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative">
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-10 pt-14 sm:px-6 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[1.3fr_1fr] lg:pt-10">
        <div>
          <Greeting />

          <h1 id="hero-title" className="mt-5 font-serif text-[clamp(3rem,8.5vw,6.2rem)] font-semibold leading-[0.98] tracking-tight">
            {profile.firstName} <Highlight>{profile.lastName}</Highlight>
          </h1>

          <RoleLine />
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{profile.tagline}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={profile.resume} download icon="↓">Download resume</Button>
            <Button variant="ghost" href="#projects" icon="→" onClick={(e) => { e.preventDefault(); scrollToSection("projects"); }}>
              See projects
            </Button>
            <Button variant="ghost" href="#contact" icon="✉" onClick={(e) => { e.preventDefault(); scrollToSection("contact"); }}>
              Say hi
            </Button>
          </div>
        </div>

        <Polaroid />
      </div>

      <HeroTiles />
    </section>
  );
}

function Greeting() {
  const [h] = useState(() => new Date().getHours());
  const hello = h < 5 ? "Up late? Me too" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Hello, night owl";
  return (
    <p className="hud-label flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="flex items-center gap-1.5 text-blue"><span className="pulse-dot h-2 w-2 rounded-full bg-blue" /> Mission log · page 01</span>
      <span>{hello} 👋</span>
    </p>
  );
}

// Types out each role in a monospace "currently:" line
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
    <p className="mt-6 font-mono text-base sm:text-lg">
      <span className="text-muted">currently: </span>
      <span className="sr-only">{profile.roles.join(", ")}</span>
      <span aria-hidden="true" className="font-semibold text-blue">
        {text}
        <span className="caret">▍</span>
      </span>
    </p>
  );
}

// The photo as a taped polaroid, with space doodles and a margin note around it
function Polaroid() {
  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <Sketch kind="planet" className="absolute -right-2 -top-10 h-24 w-24 text-blue/70" />
      <Sketch kind="star" className="absolute -left-8 top-10 h-8 w-8 text-red/70" />
      <Sketch kind="orbit" className="absolute -bottom-10 -left-12 hidden h-24 w-32 text-blue/50 sm:block" />
      <m.figure
        initial={{ opacity: 0, y: 24, rotate: 4 }}
        animate={{ opacity: 1, y: 0, rotate: 2 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ rotate: 0, y: -4 }}
        className="card tape relative bg-card p-3 pb-4"
      >
        <div className="aspect-[4/5] overflow-hidden rounded-md">
          <Photo name="hero" priority alt="Harshit Abhinav in a white shirt, standing under trees on campus" sizes="(min-width: 1024px) 380px, 85vw" />
        </div>
        <figcaption className="mt-3 text-center font-hand text-2xl text-ink">campus · probably thinking about kernels</figcaption>
      </m.figure>
      <MarginNote arrow="left" className="absolute -bottom-12 right-2 text-2xl">that's me!</MarginNote>
    </div>
  );
}
