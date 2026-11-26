import { useEffect, useState } from "react";
import { sections } from "../../data/content";
import { scrollToSection } from "../../hooks/scrollTo";
import { getProgress } from "./progress";

// The altitude gauge on the right edge (large screens): one marker per level,
// a little rocket that climbs as you scroll, and a live altitude readout.
export default function AltitudeMeter() {
  const [p, setP] = useState({ i: 0, frac: 0 });

  useEffect(() => {
    let ticking = false;
    const update = () => { ticking = false; setP(getProgress()); };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  const n = sections.length;
  const pos = (p.i + p.frac) / (n - 1); // 0 at Street, 1 at Moon
  const a0 = sections[p.i].altitude, a1 = sections[Math.min(n - 1, p.i + 1)].altitude;
  const alt = a0 + (a1 - a0) * p.frac;

  return (
    <nav aria-label="Altitude" className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      <div className="px-panel flex flex-col items-center px-2 py-3">
        <span className="font-pixel text-[0.62rem] uppercase text-muted">Alt</span>
        <span className="tabular w-16 text-center font-pixel text-xs text-accent">{formatAlt(alt)}</span>
        <ol className="relative mt-2 flex h-[48vh] flex-col-reverse justify-between">
          <span aria-hidden="true" className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-line-strong" />
          <span
            aria-hidden="true"
            className="absolute left-1/2 z-10 -translate-x-1/2 translate-y-1/2 text-sm transition-[bottom] duration-150"
            style={{ bottom: `${pos * 100}%` }}
          >
            🚀
          </span>
          {sections.map((s, idx) => (
            <li key={s.id} className="relative z-0 flex justify-center">
              <a
                href={`#${s.id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(s.id); }}
                aria-label={`Level ${s.code}: ${s.codename} (${s.label})`}
                aria-current={idx === p.i ? "true" : undefined}
                className={`group relative block h-3 w-3 border-2 ${idx <= p.i ? "border-[var(--px-edge)] bg-accent-fill" : "border-line-strong bg-panel"}`}
              >
                <span className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 whitespace-nowrap border-2 border-[var(--px-edge)] bg-panel px-2 py-0.5 font-pixel text-xs group-hover:block group-focus-visible:block">
                  {s.code} · {s.codename}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

function formatAlt(m) {
  if (m < 1000) return `${Math.round(m)} m`;
  const km = m / 1000;
  if (km < 1000) return `${km.toFixed(km < 10 ? 1 : 0)} km`;
  return `${Math.round(km).toLocaleString("en-US")} km`;
}
