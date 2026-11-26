import { forwardRef } from "react";
import { m } from "motion/react";
import Badge from "../ui/Badge";
import Telemetry from "./Telemetry";
import StatusChip from "./StatusChip";

// One "mission file" card. Shows the problem → solution in two lines,
// the tech used, links, and a button that opens the full details.
const ProjectCard = forwardRef(function ProjectCard({ project: p, index, onOpen }, ref) {
  return (
    <m.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      data-perch
      data-project={p.id}
      className={`px-panel group relative flex flex-col p-5 transition-transform hover:-translate-y-1 ${p.featured ? "px-panel-accent" : ""}`}
    >
      {p.featured && <span aria-hidden="true" className="absolute -top-3.5 right-4 bg-accent-fill px-2 py-0.5 font-pixel text-xs uppercase text-accent-ink">★ Featured</span>}
      <div className="flex items-center justify-between gap-3">
        <span className="hud-label text-[0.62rem]">MSN-{String(index + 1).padStart(2, "0")} · {p.year}</span>
        <StatusChip status={p.status} />
      </div>
      <Telemetry seed={p.id} className="mt-3 h-6 w-full opacity-60 transition-opacity group-hover:opacity-100" />

      <h3 className="mt-3 font-pixel text-2xl leading-none">{p.title}</h3>
      <p className="mt-1 text-sm text-muted">{p.subtitle}</p>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex gap-3">
          <dt className="hud-label w-16 shrink-0 pt-0.5 text-[0.6rem]">Problem</dt>
          <dd className="line-clamp-2 text-muted">{p.problem}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="hud-label w-16 shrink-0 pt-0.5 text-[0.6rem] text-accent">Solution</dt>
          <dd className="line-clamp-2">{p.solution}</dd>
        </div>
      </dl>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech used">
        {p.tech.map((t) => <li key={t}><Badge>{t}</Badge></li>)}
      </ul>

      <div className="mt-auto flex items-center gap-2 pt-5">
        <button
          type="button"
          onClick={() => onOpen(p)}
          aria-label={`Read more about ${p.title}`}
          className="mr-auto font-mono text-xs uppercase tracking-widest text-accent underline-offset-4 hover:underline"
        >
          Read more →
        </button>
        {p.github && <IconLink href={p.github} label={`${p.title} source code on GitHub`}>GitHub</IconLink>}
        {p.demo && <IconLink href={p.demo} label={`${p.title} live demo`} accent>Live ↗</IconLink>}
      </div>
    </m.li>
  );
});

export default ProjectCard;

export function IconLink({ href, label, children, accent }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={`border-2 px-2 py-1 font-pixel text-xs uppercase transition ${accent ? "border-accent-fill bg-accent-fill text-accent-ink hover:brightness-110" : "border-line-strong text-muted hover:border-accent hover:text-accent"}`}
    >
      {children}
    </a>
  );
}
