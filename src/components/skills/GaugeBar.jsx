import { useEffect, useState } from "react";

// A simple ink meter for one skill. It fills from 0 once `on` is true
// (in view), and again every time it is mounted.
export default function GaugeBar({ name, level, on }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!on) return;
    const id = requestAnimationFrame(() => setGo(true));
    return () => cancelAnimationFrame(id);
  }, [on]);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span>{name}</span>
        <span className="tabular font-mono text-xs text-muted">{level}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border border-line bg-card-2" role="meter" aria-label={name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={level}>
        <div className="h-full rounded-full bg-[repeating-linear-gradient(45deg,var(--blue)_0_6px,color-mix(in_srgb,var(--blue)_78%,white)_6px_12px)] transition-[width] duration-1000 ease-out" style={{ width: go ? `${level}%` : "0%" }} />
      </div>
    </div>
  );
}
