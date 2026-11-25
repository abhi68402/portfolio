// A tiny decorative "signal trace" unique to each project.
// The shape comes from the project id, so it never changes between visits.
export default function Telemetry({ seed, className = "" }) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rand = () => ((h = (h * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const pts = Array.from({ length: 24 }, (_, i) => `${(i / 23) * 120},${6 + rand() * 16}`).join(" ");
  return (
    <svg viewBox="0 0 120 28" className={className} aria-hidden="true" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
