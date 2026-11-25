// A segmented "instrument" bar: 20 blocks, lit up to the skill level.
// `on` turns the lights on (we flip it when the card scrolls into view).
export default function GaugeBar({ name, level, on }) {
  const lit = Math.round(level / 5);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span>{name}</span>
        <span className="tabular font-mono text-xs text-muted">{level}</span>
      </div>
      <div className="flex gap-[3px]" role="meter" aria-label={name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={level}>
        {Array.from({ length: 20 }, (_, i) => (
          <span
            key={i}
            className="h-2 flex-1 rounded-[1px] transition-colors duration-300"
            style={{
              background: on && i < lit ? "var(--accent-fill)" : "var(--line)",
              transitionDelay: `${i * 25}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
