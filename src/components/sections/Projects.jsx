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
    <SectionFrame id="projects" title="Quest log" kicker="What I built, why, and how. Go ahead and throw a card around: it always comes back.">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <FilterTabs value={filter} onChange={setFilter} counts={counts} />
        <p className="font-display text-sm uppercase text-muted" aria-live="polite">{shown.length} quests on screen</p>
      </div>

      <ul className="grid gap-x-6 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
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
