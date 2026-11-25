import { m } from "motion/react";
import { sections } from "../../data/content";

// The console "module" wrapper every section uses: a mono label
// (MOD 04 · MISSION LOG), a ruler line with ticks, and the big heading.
// It fades the section in the first time it scrolls into view.
export default function SectionFrame({ id, title, kicker, children, className = "" }) {
  const meta = sections.find((s) => s.id === id);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 ${className}`}>
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <span className="hud-label text-accent">MOD {meta?.code}</span>
          <span className="hud-label">· {meta?.codename}</span>
          <Ruler />
        </div>
        <h2 id={`${id}-title`} className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h2>
        {kicker && <p className="mt-3 max-w-2xl text-muted">{kicker}</p>}
      </header>
      <m.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.div>
    </section>
  );
}

// A thin line with tick marks, like the edge of an instrument dial.
function Ruler() {
  return (
    <span aria-hidden="true" className="relative h-3 flex-1 overflow-hidden">
      <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
      <span
        className="absolute inset-0 opacity-70"
        style={{ backgroundImage: "linear-gradient(90deg, var(--line-strong) 1px, transparent 1px)", backgroundSize: "12px 6px", backgroundRepeat: "repeat-x", backgroundPosition: "0 3px" }}
      />
    </span>
  );
}
