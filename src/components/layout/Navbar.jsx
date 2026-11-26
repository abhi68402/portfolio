import { useState } from "react";
import { sections, profile } from "../../data/content";
import { useActiveSection } from "../../hooks/useActiveSection";
import { scrollToSection } from "../../hooks/scrollTo";
import { useTheme } from "../../hooks/useTheme";
import { useChaos } from "../../hooks/useChaos";

const ids = sections.map((s) => s.id);

// Sticky top bar. Highlights the section you're reading; collapses into a menu on phones.
export default function Navbar({ onPlay }) {
  const active = useActiveSection(ids);
  const { theme, toggle } = useTheme();
  const [chaos, setChaos] = useChaos();
  const [open, setOpen] = useState(false);

  const go = (e, id) => {
    e.preventDefault();
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/75 backdrop-blur-md">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-accent-fill focus:px-3 focus:py-2 focus:text-accent-ink">
        Skip to content
      </a>
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#hero" onClick={(e) => go(e, "hero")} className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-widest">
          <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-[#ff2bd6] font-display text-sm text-[#14041f] shadow-[0_0_14px_#ff2bd6]">
            HA
            <span className="pulse-dot absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#22e6ff]" />
          </span>
          <span className="hidden whitespace-nowrap font-display text-sm xl:inline">{profile.name.toUpperCase()}</span>
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
                  className={`relative flex items-baseline gap-1.5 px-2.5 py-1.5 text-sm font-medium transition ${isActive ? "text-text" : "text-muted hover:text-text"}`}
                >
                  <span className={`font-mono text-[0.65rem] ${isActive ? "text-accent" : ""}`}>{s.code}</span>
                  {s.label}
                  {isActive && <span className="absolute inset-x-2.5 -bottom-[13px] h-0.5 bg-[var(--mag)] shadow-[0_0_8px_var(--mag)]" />}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPlay}
            className="neon-btn neon-btn-primary hidden !px-3 !py-1.5 !text-sm sm:inline-flex"
          >
            👾 Blitz
          </button>
          <button
            type="button"
            onClick={() => setChaos(!chaos)}
            aria-pressed={!chaos}
            title={chaos ? "Pause the bug, CRT and other chaos" : "Bring the chaos back"}
            className={`hidden h-9 items-center gap-1.5 rounded-lg border-2 px-2.5 font-mono text-[0.68rem] uppercase tracking-wider transition sm:inline-flex ${chaos ? "border-line-strong text-muted hover:border-[var(--cyan)] hover:text-[var(--cyan)]" : "border-[var(--mag)] text-[var(--mag)]"}`}
          >
            {chaos ? "⏸ Pause chaos" : "▶ Chaos"}
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="grid h-9 w-9 place-items-center rounded-lg border-2 border-line-strong text-muted transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
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
          <li>
            <button type="button" onClick={() => { setOpen(false); onPlay(); }} className="flex w-full items-baseline gap-3 py-3 text-left">
              <span className="font-mono text-xs text-muted">👾</span> Play Bug Blitz
            </button>
          </li>
          <li>
            <button type="button" onClick={() => { setOpen(false); setChaos(!chaos); }} className="flex w-full items-baseline gap-3 py-3 text-left">
              <span className="font-mono text-xs text-muted">{chaos ? "⏸" : "▶"}</span> {chaos ? "Pause chaos" : "Bring back the chaos"}
            </button>
          </li>
        </ul>
      )}
    </header>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
