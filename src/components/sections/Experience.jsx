import { experience } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";

// MOD 05 · Flight Record. A vertical timeline drawn like a telemetry trace.
export default function Experience() {
  return (
    <SectionFrame id="experience" title="Flight record">
      <ol className="relative ml-2 border-l border-dashed border-line-strong sm:ml-[8.5rem]">
        {experience.map((e, i) => (
          <li key={`${e.org}-${i}`} className="relative pb-8 pl-7 last:pb-0 sm:pl-10">
            {/* node on the trace */}
            <span aria-hidden="true" className="absolute -left-[7px] top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full border border-accent bg-bg">
              <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "pulse-dot bg-accent-fill" : "bg-accent-fill/60"}`} />
            </span>
            {/* period sits to the left of the line on larger screens */}
            <p className="hud-label tabular mb-1 text-[0.65rem] sm:absolute sm:-left-[8.5rem] sm:top-1 sm:w-28 sm:text-right">
              T · {e.period}
            </p>
            <div className="neon-panel p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-xl">{e.role}</h3>
                <span className="hud-label text-[0.62rem]">{e.location}</span>
              </div>
              <p className="text-accent">{e.org}</p>
              <ul className="mt-3 space-y-2">
                {e.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span aria-hidden="true" className="mt-2 h-1 w-3 shrink-0 bg-line-strong" />
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
