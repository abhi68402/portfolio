import { certifications } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";

// LOG ENTRY 06 · Badges. Each certification is a round mission patch.
// Hidden automatically if the list in content.js is empty.
export default function Certifications() {
  if (!certifications.length) return null;
  return (
    <SectionFrame id="certifications" title="Badges earned" doodle="star">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {certifications.map((c, i) => {
          const body = (
            <>
              <span aria-hidden="true" className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-dashed border-blue bg-hl/40 font-mono text-sm font-bold tracking-wide text-ink transition-transform duration-500 group-hover:rotate-[360deg]">
                {c.badge || c.issuer.slice(0, 3).toUpperCase()}
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold leading-tight">{c.name}</h3>
              <p className="mt-1 text-sm font-medium text-blue">{[c.issuer, c.year].filter(Boolean).join(" · ")}</p>
              {c.focus && <p className="mt-2 text-sm leading-snug text-muted">{c.focus}</p>}
            </>
          );
          const cls = "card lift group block h-full p-5 text-center";
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
