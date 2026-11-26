import { m } from "motion/react";
import { sections } from "../../data/content";
import Highlight from "../notebook/Highlight";
import Sketch from "../notebook/Sketch";

// Every section is a "log entry" in the mission notebook: a small mono label,
// a big serif heading with a highlighter swipe, and an optional space doodle
// in the margin. The content fades up once when it scrolls into view.
export default function SectionFrame({ id, title, kicker, doodle, children, className = "" }) {
  const meta = sections.find((s) => s.id === id);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 ${className}`}>
      {doodle && <Sketch kind={doodle} className="drift pointer-events-none absolute right-4 top-12 hidden h-28 w-28 text-blue/60 lg:block" />}
      <header className="mb-10 max-w-3xl">
        <p className="hud-label">
          Log entry {meta?.code} <span className="text-red">·</span> {meta?.codename}
        </p>
        <h2 id={`${id}-title`} className="mt-3 font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          <Highlight>{title}</Highlight>
        </h2>
        {kicker && <p className="mt-4 max-w-2xl text-lg text-muted">{kicker}</p>}
      </header>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.div>
    </section>
  );
}
