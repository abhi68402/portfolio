import { m } from "motion/react";
import { sections } from "../../data/content";

// Every section is a "level" in Nova's journey. This wrapper draws the level
// plaque (LEVEL 03 · THE LAB + an XP bar), the heading, and fades content in.
// data-perch marks surfaces Nova is allowed to stand on.
export default function SectionFrame({ id, title, kicker, children, className = "" }) {
  const idx = sections.findIndex((s) => s.id === id);
  const meta = sections[idx];
  const progress = Math.round(((idx + 1) / sections.length) * 100);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative mx-auto w-full max-w-6xl px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-32 ${className}`}>
      <header data-perch className="px-panel mb-14 inline-block max-w-3xl px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-pixel text-sm text-accent">LEVEL {meta?.code}</span>
          <span className="font-pixel text-sm uppercase text-muted">· {meta?.codename}</span>
          <span aria-hidden="true" className="ml-1 flex h-2.5 w-24 border-2 border-line-strong bg-panel-2">
            <span className="h-full bg-accent-fill" style={{ width: `${progress}%` }} />
          </span>
        </div>
        <h2 id={`${id}-title`} className="mt-2 font-pixel text-4xl font-bold leading-none sm:text-6xl">
          {title}
        </h2>
        {kicker && <p className="mt-3 max-w-2xl text-muted">{kicker}</p>}
      </header>
      <m.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.div>
    </section>
  );
}
