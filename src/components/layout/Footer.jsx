import { profile } from "../../data/content";

// Bottom of the notebook: a handwritten sign-off, a version label that links
// to the site's earlier versions on GitHub, the Bolt switch, and the tiny
// ">_" button that is the hidden way into the terminal.
const VERSION = "v5 · notebook edition";

export default function Footer({ onTerminal, botOn, onToggleBot }) {
  return (
    <footer className="border-t border-dashed border-line-strong">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="font-hand text-2xl leading-snug text-ink sm:text-3xl">
          Make it fast. Make it honest. <span className="text-blue">Make it ship.</span>
        </p>
        <p className="mt-1 font-hand text-xl text-muted">— {profile.firstName}</p>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="hud-label flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© {new Date().getFullYear()} {profile.name}</span>
            <a
              href={`${profile.links.github}/portfolio/commits/main`}
              target="_blank"
              rel="noreferrer"
              title="See how this site changed over time"
              className="rounded border border-line-strong px-1.5 py-0.5 transition hover:border-blue hover:text-blue"
            >
              {VERSION}
            </a>
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button type="button" onClick={() => window.dispatchEvent(new Event("bolt-tour"))} className="squiggle text-sm font-medium text-blue">
              Take the tour with Bolt
            </button>
            <button type="button" onClick={() => onToggleBot(!botOn)} className="squiggle text-sm text-muted hover:text-ink">
              {botOn ? "Hide Bolt" : "Bring back Bolt"}
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
      </div>
    </footer>
  );
}
