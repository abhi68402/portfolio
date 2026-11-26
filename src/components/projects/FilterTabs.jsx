import { projectFilters } from "../../data/content";

// Filter buttons (All / AI-ML / Web / IoT / Systems) with live counts,
// styled like notebook tab dividers.
export default function FilterTabs({ value, onChange, counts }) {
  return (
    <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
      {projectFilters.map((f) => {
        const on = value === f.id;
        return (
          <button
            key={f.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(f.id)}
            className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold transition ${on ? "border-ink bg-hl text-ink shadow-[2px_2px_0_var(--ink)]" : "border-line-strong bg-card text-muted hover:border-ink hover:text-ink"}`}
          >
            {f.label} <span className="font-mono text-xs opacity-70">{counts[f.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
