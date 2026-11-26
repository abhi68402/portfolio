import { forwardRef } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import Badge from "../ui/Badge";
import Telemetry from "./Telemetry";
import StatusChip from "./StatusChip";

// One "mission file" card. Shows the problem → solution in two lines,
// the tech used, links, and a button that opens the full details.
// Mouse users can also grab a card and toss it; it swings back into place.
const finePointer = typeof window !== "undefined" && matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;

const ProjectCard = forwardRef(function ProjectCard({ project: p, index, onOpen }, ref) {
  // 3D tilt toward the cursor
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const onMove = (e) => {
    if (!finePointer) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return (
    <m.li
      ref={ref}
      layout
      drag={finePointer}
      dragSnapToOrigin
      dragElastic={0.65}
      dragTransition={{ bounceStiffness: 260, bounceDamping: 14 }}
      whileDrag={{ scale: 1.05, rotate: 4, zIndex: 30, cursor: "grabbing" }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      data-project={p.id}
      className={`neon-panel group relative flex flex-col p-5 ${finePointer ? "cursor-grab" : ""} ${p.featured ? "neon-panel-hot" : ""}`}
    >
      {p.featured && <span aria-hidden="true" className="absolute -top-3.5 right-4 bg-accent-fill px-2 py-0.5 font-display text-xs uppercase text-accent-ink">★ Featured</span>}
      <div className="flex items-center justify-between gap-3">
        <span className="hud-label text-[0.62rem]">Quest {String(index + 1).padStart(2, "0")} · {p.year}</span>
        <StatusChip status={p.status} />
      </div>
      <Telemetry seed={p.id} className="mt-3 h-6 w-full opacity-60 transition-opacity group-hover:opacity-100" />

      <h3 className="mt-3 font-display text-2xl leading-none" data-chewable>{p.title}</h3>
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
      className={`border-2 px-2 py-1 font-display text-xs uppercase transition ${accent ? "border-accent-fill bg-accent-fill text-accent-ink hover:brightness-110" : "border-line-strong text-muted hover:border-accent hover:text-accent"}`}
    >
      {children}
    </a>
  );
}
