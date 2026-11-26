import { projectFilters } from "../../data/content";

// Row of filter buttons (All / AI-ML / Web / IoT / Systems) with live counts.
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
            className={`border-2 px-3 py-1.5 font-display text-sm uppercase transition ${on ? "border-accent-fill bg-accent-fill text-accent-ink" : "border-line-strong text-muted hover:border-accent hover:text-accent"}`}
          >
            {f.label} <span className={on ? "opacity-70" : "opacity-60"}>{counts[f.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
