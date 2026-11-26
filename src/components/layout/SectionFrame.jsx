import { m } from "motion/react";
import { sections } from "../../data/content";

// Every section is a "stage" in the arcade. The header is a neon sign that
// flickers on when it scrolls into view; the content fades up after it.
export default function SectionFrame({ id, title, kicker, children, className = "" }) {
  const idx = sections.findIndex((s) => s.id === id);
  const meta = sections[idx];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 ${className}`}>
      <m.header
        className="neon-panel mb-10 inline-block max-w-3xl px-5 py-5 sm:px-7 sm:py-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.01 }}
        onViewportEnter={(e) => e?.target?.querySelector?.("h2")?.classList.add("sign-on")}
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          <span className="neon-cyan">Stage {meta?.code}</span> · {meta?.codename}
        </p>
        <h2 id={`${id}-title`} className="mt-3 font-display text-4xl leading-none sm:text-6xl">
          <span className="neon-mag" data-chewable>{title}</span>
        </h2>
        {kicker && <p className="mt-4 max-w-2xl text-muted">{kicker}</p>}
      </m.header>
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
