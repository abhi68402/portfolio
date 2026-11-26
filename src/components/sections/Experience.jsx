import { useEffect, useRef, useState } from "react";
import { experience } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";

// LOG ENTRY 05 · Flight record. A dashed flight path with a little rocket
// that climbs along it as you scroll through the entries.
export default function Experience() {
  const listRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = listRef.current;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight * 0.6 - r.top) / Math.max(1, r.height);
      setProgress(Math.max(0, Math.min(1, p)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <SectionFrame id="experience" title="Flight record" doodle="satellite">
      <ol ref={listRef} className="focus-list relative ml-3 sm:ml-[9rem]">
        {/* the flight path + the rocket riding it */}
        <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 border-l-2 border-dashed border-line-strong" />
        <span aria-hidden="true" className="absolute left-0 top-0 w-0.5 -translate-x-[1px] bg-blue transition-[height] duration-150" style={{ height: `${progress * 100}%` }} />
        <span aria-hidden="true" className="absolute left-0 -translate-x-1/2 -translate-y-1/2 text-xl transition-[top] duration-150" style={{ top: `${progress * 100}%` }}>🚀</span>

        {experience.map((e, i) => (
          <li key={`${e.org}-${i}`} className="relative pb-12 pl-8 last:pb-0 sm:pl-10">
            <span aria-hidden="true" className="absolute -left-[7px] top-2 h-3.5 w-3.5 rounded-full border-2 border-ink bg-hl" />
            <p className="hud-label tabular mb-1 sm:absolute sm:-left-[9rem] sm:top-1.5 sm:w-28 sm:text-right">{e.period}</p>
            <div className={`card lift rise p-5 ${i % 2 ? "tilt-r" : "tilt-l"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-serif text-xl font-semibold">{e.role}</h3>
                <span className="hud-label">{e.location}</span>
              </div>
              <p className="font-medium text-blue">{e.org}</p>
              <ul className="mt-3 space-y-2">
                {e.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-muted">
                    <span aria-hidden="true" className="text-red">✦</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </SectionFrame>
  );
}
