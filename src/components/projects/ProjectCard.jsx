import { forwardRef } from "react";
import { m } from "motion/react";
import Badge from "../ui/Badge";
import StatusChip from "./StatusChip";

// One project as an index card pinned in the notebook: problem → solution,
// the tech used, links, a red-pen margin note, and "Read more" for details.
const ProjectCard = forwardRef(function ProjectCard({ project: p, index, onOpen }, ref) {
  const tilt = index % 3 === 0 ? "tilt-l" : index % 3 === 2 ? "tilt-r" : "";
  return (
    <m.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className={`card lift rise ${tilt} ${p.featured ? "tape" : ""} relative flex flex-col p-5 pt-6`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="hud-label">#{String(index + 1).padStart(2, "0")} · {p.year}</span>
        <StatusChip status={p.status} />
      </div>

      <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight">{p.title}</h3>
      <p className="mt-1 text-sm text-muted">{p.subtitle}</p>
      {p.note && <p aria-hidden="true" className="mt-1 -rotate-2 font-hand text-xl text-red">{p.note}</p>}

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex gap-3">
          <dt className="hud-label w-16 shrink-0 pt-0.5">Problem</dt>
          <dd className="line-clamp-2 text-muted">{p.problem}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="hud-label w-16 shrink-0 pt-0.5 !text-blue">Solution</dt>
          <dd className="line-clamp-2">{p.solution}</dd>
        </div>
      </dl>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech used">
        {p.tech.map((t) => <li key={t}><Badge>{t}</Badge></li>)}
      </ul>

      <div className="mt-auto flex items-center gap-2 pt-5">
        <button type="button" onClick={() => onOpen(p)} aria-label={`Read more about ${p.title}`} className="squiggle mr-auto font-medium text-blue">
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
      className={`rounded-lg border-2 px-2.5 py-1 text-xs font-semibold transition ${accent ? "btn-primary border-blue hover:brightness-110" : "border-line-strong text-muted hover:border-ink hover:text-ink"}`}
    >
      {children}
    </a>
  );
}
