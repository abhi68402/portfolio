import { profile } from "../../data/content";

// Bottom strip. The tiny ">_" button is the hidden way into the terminal.
export default function Footer({ onTerminal, botOn, onToggleBot }) {
  return (
    <footer className="border-t border-dashed border-line-strong">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
        <p className="hud-label">
          © {new Date().getFullYear()} {profile.name} · Built with React, Tailwind & a lot of doodles
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="button" onClick={() => onToggleBot(!botOn)} className="squiggle text-sm text-muted hover:text-ink">
          {botOn ? "Hide Bolt 🤖" : "Bring back Bolt 🤖"}
        </button>
        <p className="hud-label flex items-center gap-2">
          <span>
            psst… press <kbd className="rounded border border-line-strong px-1.5 py-0.5 text-accent">`</kbd> for the secret terminal
          </span>
          <button
            type="button"
            onClick={onTerminal}
            aria-label="Open terminal mode"
            className="rounded border border-transparent px-1.5 py-0.5 text-muted opacity-60 transition hover:border-line-strong hover:text-accent hover:opacity-100"
          >
            &gt;_
          </button>
        </p>
        </div>
      </div>
    </footer>
  );
}
