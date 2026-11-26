// A simple ink meter for one skill (filled when `on`, i.e. once in view).
export default function GaugeBar({ name, level, on }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span>{name}</span>
        <span className="tabular font-mono text-xs text-muted">{level}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-card-2" role="meter" aria-label={name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={level}>
        <div className="h-full rounded-full bg-blue transition-[width] duration-1000 ease-out" style={{ width: on ? `${level}%` : "0%" }} />
      </div>
    </div>
  );
}
