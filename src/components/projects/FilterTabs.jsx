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
            className={`rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition ${on ? "border-accent-fill bg-accent-fill text-accent-ink" : "border-line-strong text-muted hover:border-accent hover:text-accent"}`}
          >
            {f.label} <span className={on ? "opacity-70" : "opacity-60"}>{counts[f.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
