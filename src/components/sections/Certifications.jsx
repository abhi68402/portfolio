import { certifications } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";

// MOD 06 · Clearances. Hidden automatically if the list in content.js is empty.
export default function Certifications() {
  if (!certifications.length) return null;
  return (
    <SectionFrame id="certifications" title="Certifications">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {certifications.map((c, i) => {
          const body = (
            <>
              <div className="flex items-center justify-between">
                <span className="hud-label text-[0.6rem]">CLR-{String(i + 1).padStart(2, "0")}</span>
                <span className="tabular font-mono text-xs text-muted">{c.year}</span>
              </div>
              <h3 className="mt-6 font-semibold leading-snug">{c.name}</h3>
              <p className="mt-1 text-sm text-muted">{c.issuer}</p>
              <span aria-hidden="true" className="mt-4 block h-0.5 w-8 bg-accent-fill transition-all group-hover:w-16" />
            </>
          );
          const cls = "group block h-full rounded-lg border border-line bg-panel p-4 transition hover:border-line-strong";
          return (
            <li key={`${c.name}-${i}`}>
              {c.url ? <a href={c.url} target="_blank" rel="noreferrer" className={cls}>{body}</a> : <div className={cls}>{body}</div>}
            </li>
          );
        })}
      </ul>
    </SectionFrame>
  );
}
