import Modal, { CloseButton } from "../ui/Modal";
import Badge from "../ui/Badge";
import StatusChip from "./StatusChip";
import { IconLink } from "./ProjectCard";

// The full write-up for one project, opened by "Read more".
export default function ProjectModal({ project: p, onClose }) {
  return (
    <Modal onClose={onClose} labelledBy="project-modal-title" className="max-w-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-card/95 px-5 py-3 backdrop-blur">
        <span className="hud-label">Mission report · {p.year}</span>
        <CloseButton onClick={onClose} />
      </div>
      <div className="p-5 sm:p-7">
        <StatusChip status={p.status} />
        <h3 id="project-modal-title" className="mt-3 font-serif text-4xl font-semibold leading-tight">{p.title}</h3>
        <p className="mt-1 text-muted">{p.subtitle}</p>
        {p.note && <p aria-hidden="true" className="mt-1 -rotate-1 font-hand text-2xl text-red">{p.note}</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-card-2 p-4">
            <h4 className="hud-label">Problem</h4>
            <p className="mt-2 text-sm leading-relaxed">{p.problem}</p>
          </div>
          <div className="rounded-lg border-2 border-blue/40 bg-blue/5 p-4">
            <h4 className="hud-label !text-blue">Solution</h4>
            <p className="mt-2 text-sm leading-relaxed">{p.solution}</p>
          </div>
        </div>

        <h4 className="hud-label mt-6">Notes</h4>
        <ul className="mt-3 space-y-2.5">
          {p.details.map((d) => (
            <li key={d} className="flex gap-3 text-sm leading-relaxed">
              <span aria-hidden="true" className="mt-0.5 text-red">✦</span>
              {d}
            </li>
          ))}
        </ul>

        <h4 className="hud-label mt-6">Stack</h4>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {p.tech.map((t) => <li key={t}><Badge>{t}</Badge></li>)}
        </ul>

        <div className="mt-7 flex flex-wrap gap-2">
          {p.github && <IconLink href={p.github} label={`${p.title} source code on GitHub`}>View source on GitHub</IconLink>}
          {p.demo && <IconLink href={p.demo} label={`${p.title} live demo`} accent>Open live demo ↗</IconLink>}
        </div>
      </div>
    </Modal>
  );
}
