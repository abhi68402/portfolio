import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { projects, projectFilters } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";
import FilterTabs from "../projects/FilterTabs";
import ProjectCard from "../projects/ProjectCard";
import ProjectModal from "../projects/ProjectModal";

// MOD 04 · Mission Log. Featured projects first, filterable by category.
export default function Projects() {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);

  // Featured first, keep the order from content.js otherwise.
  const ordered = useMemo(() => [...projects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)), []);
  const counts = useMemo(
    () => Object.fromEntries(projectFilters.map((f) => [f.id, f.id === "all" ? projects.length : projects.filter((p) => p.category.includes(f.id)).length])),
    []
  );
  const shown = filter === "all" ? ordered : ordered.filter((p) => p.category.includes(filter));

  return (
    <SectionFrame id="projects" title="Missions flown" kicker="What I built, why, and how. The red scribbles are my own notes." doodle="rocket">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <FilterTabs value={filter} onChange={setFilter} counts={counts} />
        <p className="font-hand text-xl text-muted" aria-live="polite">{shown.length} missions on this page</p>
      </div>

      <ul className="focus-list grid gap-x-7 gap-y-10 pt-3 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <ProjectCard key={p.id} project={p} index={ordered.indexOf(p)} onOpen={setOpen} />
          ))}
        </AnimatePresence>
      </ul>

      <AnimatePresence>{open && <ProjectModal key={open.id} project={open} onClose={close} />}</AnimatePresence>
    </SectionFrame>
  );
}
