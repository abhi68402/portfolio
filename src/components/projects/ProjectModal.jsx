import Modal, { CloseButton } from "../ui/Modal";
import Badge from "../ui/Badge";
import Telemetry from "./Telemetry";
import StatusChip from "./StatusChip";
import { IconLink } from "./ProjectCard";

// Full "mission briefing" for one project, opened by "Read more".
export default function ProjectModal({ project: p, onClose }) {
  return (
    <Modal onClose={onClose} labelledBy="project-modal-title" className="max-w-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-panel/95 px-5 py-3 backdrop-blur">
        <span className="hud-label text-[0.62rem]">Mission briefing · {p.year}</span>
        <CloseButton onClick={onClose} />
      </div>
      <div className="p-5 sm:p-7">
        <StatusChip status={p.status} />
        <h3 id="project-modal-title" className="mt-3 font-pixel text-4xl leading-none">{p.title}</h3>
        <p className="mt-1 text-muted">{p.subtitle}</p>
        <Telemetry seed={p.id} className="my-5 h-8 w-full" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-2 border-line-strong bg-panel-2 p-4">
            <h4 className="hud-label text-[0.62rem]">Problem</h4>
            <p className="mt-2 text-sm leading-relaxed">{p.problem}</p>
          </div>
          <div className="border-2 border-accent-fill bg-accent-soft p-4">
            <h4 className="hud-label text-[0.62rem] text-accent">Solution</h4>
            <p className="mt-2 text-sm leading-relaxed">{p.solution}</p>
          </div>
        </div>

        <h4 className="hud-label mt-6 text-[0.62rem]">Flight notes</h4>
        <ul className="mt-3 space-y-2.5">
          {p.details.map((d) => (
            <li key={d} className="flex gap-3 text-sm leading-relaxed">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-accent-fill" />
              {d}
            </li>
          ))}
        </ul>

        <h4 className="hud-label mt-6 text-[0.62rem]">Stack</h4>
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
