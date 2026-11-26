import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { profile } from "../../data/content";

// "Latest on GitHub": the three public repos pushed most recently, fetched
// live from GitHub's public API (no login) once the card scrolls into view.
// Cached for the visit so it costs one request. If GitHub is unreachable or
// rate-limited, it quietly shows a link to the profile instead.
const USER = profile.links.github.replace(/\/+$/, "").split("/").pop();
const API = `https://api.github.com/users/${USER}/repos?sort=pushed&per_page=10&type=owner`;
const CACHE = "gh-latest";

const LANG_COLORS = { Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6", C: "#555555", "C++": "#f34b7d", Java: "#b07219", HTML: "#e34c26", CSS: "#563d7c", "Jupyter Notebook": "#DA5B0B" };

function ago(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [u, n] of units) {
    const v = Math.floor(s / n);
    if (v >= 1) return `${v} ${u}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export default function GitHubLatest() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "200px" });
  const [state, setState] = useState({ status: "idle", repos: [] });

  useEffect(() => {
    if (!inView) return;
    try {
      const hit = JSON.parse(sessionStorage.getItem(CACHE) || "null");
      if (hit?.length) { setState({ status: "ok", repos: hit }); return; }
    } catch { /* storage blocked: just fetch */ }

    const ctrl = new AbortController();
    setState((s) => ({ ...s, status: "loading" }));
    fetch(API, { signal: ctrl.signal, headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((list) => {
        const repos = list
          .filter((r) => !r.fork && !r.archived)
          .slice(0, 3)
          .map((r) => ({ name: r.name, url: r.html_url, desc: r.description, lang: r.language, pushed: r.pushed_at }));
        if (!repos.length) throw new Error("empty");
        try { sessionStorage.setItem(CACHE, JSON.stringify(repos)); } catch { /* ignore */ }
        setState({ status: "ok", repos });
      })
      .catch((e) => { if (e?.name !== "AbortError") setState({ status: "error", repos: [] }); });
    return () => ctrl.abort();
  }, [inView]);

  return (
    <div ref={ref} className="card tilt-l p-5">
      <p className="hud-label flex items-center gap-2">
        <span className="pulse-dot h-2 w-2 rounded-full bg-blue" /> Latest on GitHub
      </p>

      {state.status === "ok" ? (
        <ul className="mt-3 divide-y divide-dashed divide-line-strong">
          {state.repos.map((r) => (
            <li key={r.name} className="py-2.5 first:pt-1">
              <a href={r.url} target="_blank" rel="noreferrer" className="group block">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-semibold text-ink transition group-hover:text-blue">{r.name}</span>
                  <span aria-hidden="true" className="text-muted transition group-hover:translate-x-0.5 group-hover:text-blue">↗</span>
                </span>
                {r.desc && <span className="mt-0.5 line-clamp-2 text-sm text-muted">{r.desc}</span>}
                <span className="mt-1 flex items-center gap-3 font-mono text-xs text-muted">
                  {r.lang && (
                    <span className="flex items-center gap-1.5">
                      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: LANG_COLORS[r.lang] || "var(--muted)" }} />
                      {r.lang}
                    </span>
                  )}
                  <span>updated {ago(r.pushed)}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : state.status === "error" ? (
        <p className="mt-3 text-sm text-muted">Couldn't reach GitHub just now.</p>
      ) : (
        <ul className="mt-3 space-y-3" aria-label="Loading recent repositories">
          {[0, 1, 2].map((i) => (
            <li key={i} className="space-y-1.5">
              <span className="block h-3.5 w-2/5 animate-pulse rounded bg-card-2" />
              <span className="block h-3 w-4/5 animate-pulse rounded bg-card-2" />
            </li>
          ))}
        </ul>
      )}

      <a href={profile.links.github} target="_blank" rel="noreferrer" className="squiggle mt-3 inline-block text-sm font-medium text-blue">
        See all on GitHub ↗
      </a>
    </div>
  );
}
