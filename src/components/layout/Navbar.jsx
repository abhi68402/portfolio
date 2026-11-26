import { useState } from "react";
import { m, useScroll, useSpring } from "motion/react";
import { sections, profile } from "../../data/content";
import { useActiveSection } from "../../hooks/useActiveSection";
import { scrollToSection } from "../../hooks/scrollTo";

const ids = sections.map((s) => s.id);

// Sticky top bar. Highlights the section you're reading; collapses into a menu on phones.
export default function Navbar() {
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });

  const go = (e, id) => {
    e.preventDefault();
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-hl focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#hero" onClick={(e) => go(e, "hero")} className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-widest">
          <span className="relative grid h-9 w-9 -rotate-3 place-items-center rounded-lg border-2 border-ink bg-hl font-serif text-sm font-bold text-ink shadow-[2px_2px_0_var(--ink)]">
            HA
            <span className="pulse-dot absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red" />
          </span>
          <span className="hidden whitespace-nowrap font-serif text-lg font-semibold tracking-tight sm:inline">{profile.name}</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {sections.slice(1).map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => go(e, s.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative isolate flex items-baseline gap-1.5 px-2.5 py-1.5 text-sm font-medium transition ${isActive ? "text-text" : "text-muted hover:text-text"}`}
                >
                  <span className={`font-mono text-[0.65rem] ${isActive ? "text-accent" : ""}`}>{s.code}</span>
                  {s.label}
                  {isActive && <span className="absolute inset-x-1.5 bottom-0.5 -z-10 h-2.5 -rotate-1 rounded-sm bg-hl" />}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-lg border-2 border-line-strong text-muted lg:hidden"
          >
            <span aria-hidden="true" className="font-mono text-sm">{open ? "✕" : "≡"}</span>
          </button>
        </div>
      </nav>
      {/* reading progress along the bottom edge of the bar */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-[3px] h-[3px]">
        <m.div className="h-full origin-left bg-blue" style={{ scaleX: progress }} />
      </div>

      {open && (
        <ul id="mobile-menu" className="border-t border-line bg-bg px-4 py-2 lg:hidden">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => go(e, s.id)}
                aria-current={active === s.id ? "true" : undefined}
                className={`flex items-baseline gap-3 border-b border-line py-3 last:border-0 ${active === s.id ? "text-accent" : "text-text"}`}
              >
                <span className="font-mono text-xs text-muted">{s.code}</span>
                {s.label}
                <span className="hud-label ml-auto">{s.codename}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
