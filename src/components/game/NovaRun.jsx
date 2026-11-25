import { useEffect, useRef, useState } from "react";
import { gameSkills, mascot, profile } from "../../data/content";
import { safeGet, safeSet } from "../../hooks/storage";
import { scrollToSection } from "../../hooks/scrollTo";
import Modal, { CloseButton } from "../ui/Modal";
import { createRunner } from "./runner";
import { setMuted } from "./sound";

const BEST_KEY = "novarun-best";
const MUTE_KEY = "novarun-muted";

// The game window. The engine (runner.js) draws the world; this file shows
// the score bar, the title / pause / game-over screens, and the buttons.
// While the title screen is up, Nova runs a demo lap behind it.
export default function NovaRun({ onClose }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const screenRef = useRef(null);
  const bannerTimer = useRef(0);
  const [screen, setScreen] = useState("title"); // title | play | paused | over
  const [hud, setHud] = useState({ score: 0, lives: 3, mult: 1, shield: false, coffee: 0, magnet: 0, metres: 0 });
  const [banner, setBanner] = useState("");
  const [result, setResult] = useState(null);
  const [best, setBest] = useState(() => Number(safeGet(BEST_KEY, 0)) || 0);
  const [muted, setMutedState] = useState(() => safeGet(MUTE_KEY, "1") !== "0");

  useEffect(() => {
    setMuted(muted);
    safeSet(MUTE_KEY, muted ? "1" : "0");
  }, [muted]);

  useEffect(() => {
    const game = createRunner(canvasRef.current, {
      skills: gameSkills,
      reduce: matchMedia("(prefers-reduced-motion: reduce)").matches,
      onHud: setHud,
      onBanner: (text) => {
        setBanner(text);
        clearTimeout(bannerTimer.current);
        bannerTimer.current = setTimeout(() => setBanner(""), 1800);
      },
      onPause: (p) => setScreen(p ? "paused" : "play"),
      onEnd: (r) => {
        setResult(r);
        setScreen("over");
        setBest((b) => {
          const nb = Math.max(b, r.score);
          safeSet(BEST_KEY, String(nb));
          return nb;
        });
      },
    });
    gameRef.current = game;
    return () => { clearTimeout(bannerTimer.current); game.destroy(); };
  }, []);

  // keyboard focus: the main button on menus; the game area while playing
  // (so Space jumps instead of pressing a focused button)
  useEffect(() => {
    if (screen === "play") canvasRef.current?.focus();
    else screenRef.current?.querySelector("[data-autofocus]")?.focus();
  }, [screen]);

  const start = () => {
    setResult(null);
    setScreen("play");
    gameRef.current?.start();
  };

  const seeSkills = () => {
    onClose();
    setTimeout(() => scrollToSection("skills"), 250);
  };

  const skillsCaught = result ? [...new Set(result.caught)] : [];

  return (
    <Modal onClose={onClose} labelledBy="game-title" className="max-w-4xl">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 id="game-title" className="font-semibold">Nova Run</h2>
          <p className="hud-label truncate text-[0.6rem]">Jump bugs · duck 404s · grab skills</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hud-label hidden text-[0.6rem] sm:inline">Best <span className="tabular text-text">{best}</span></span>
          <IconBtn label={muted ? "Turn sound on" : "Mute sound"} onClick={() => setMutedState((m) => !m)}>{muted ? "🔇" : "🔊"}</IconBtn>
          {(screen === "play" || screen === "paused") && (
            <IconBtn label={screen === "paused" ? "Resume" : "Pause"} onClick={() => gameRef.current?.togglePause()}>{screen === "paused" ? "▶" : "⏸"}</IconBtn>
          )}
          <CloseButton onClick={onClose} label="Close game" />
        </div>
      </div>

      <div ref={screenRef} className="relative h-[min(68vh,460px)] w-full bg-bg sm:h-auto sm:max-h-[70vh] sm:aspect-[16/9]">
        <canvas
          ref={canvasRef}
          tabIndex={-1}
          className="h-full w-full touch-none select-none outline-none"
          style={{ imageRendering: "pixelated" }}
          role="img"
          aria-label="Nova Run game. Space or up arrow to jump, down arrow to duck, P to pause."
        />

        {/* score bar over the game */}
        {(screen === "play" || screen === "paused") && (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2 font-mono text-xs sm:p-3 sm:text-sm">
            <div className="flex items-center gap-1 rounded bg-black/45 px-2 py-1 text-white" aria-label={`${hud.lives} lives left`}>
              {[0, 1, 2].map((i) => <span key={i} className={i < hud.lives ? "" : "opacity-25"} aria-hidden="true">🦴</span>)}
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              {hud.shield && <Chip>🛡 tests</Chip>}
              {hud.coffee > 0 && <Chip>☕ {hud.coffee}s</Chip>}
              {hud.magnet > 0 && <Chip>🧲 {hud.magnet}s</Chip>}
              {hud.mult > 1 && <Chip accent>×{hud.mult} combo</Chip>}
              <span className="tabular rounded bg-black/45 px-2 py-1 text-white" aria-live="off">{String(hud.score).padStart(5, "0")}</span>
            </div>
          </div>
        )}

        {banner && screen === "play" && (
          <div className="pointer-events-none absolute inset-x-0 top-1/4 text-center">
            <span className="rounded bg-black/55 px-3 py-1.5 font-mono text-sm uppercase tracking-[0.2em] text-[#ffb224] sm:text-base">{banner}</span>
          </div>
        )}

        {screen === "title" && (
          <Overlay>
            <p className="hud-label text-accent">Mission: ship it</p>
            <h3 className="mt-1 text-2xl font-semibold sm:text-3xl">Help {mascot.name} reach production</h3>
            <div className="mx-auto mt-4 grid max-w-md gap-x-6 gap-y-1.5 text-left text-sm text-muted sm:grid-cols-2">
              <p><Kbd>Space</Kbd> / <Kbd>↑</Kbd> / tap: jump</p>
              <p>Hold to jump higher, tap again to double jump</p>
              <p><Kbd>↓</Kbd> / swipe down: duck under 404s</p>
              <p>Grab skill orbs in a row for combos</p>
            </div>
            <p className="mt-3 text-xs text-muted">Power-ups: ☕ coffee (unstoppable) · 🛡 unit tests (one free hit) · 🧲 git pull (magnet)</p>
            <button type="button" data-autofocus onClick={start} className="mt-5 rounded-md bg-accent-fill px-6 py-2.5 font-mono text-sm font-semibold uppercase tracking-widest text-accent-ink hover:brightness-110">
              ▶ Start run
            </button>
            {best > 0 && <p className="hud-label mt-3 text-[0.6rem]">High score {best}</p>}
            <p className="mt-2 text-xs text-muted sm:hidden">Tip: turn your phone sideways for a bigger view.</p>
          </Overlay>
        )}

        {screen === "paused" && (
          <Overlay>
            <p className="hud-label text-accent">Paused</p>
            <h3 className="mt-1 text-2xl font-semibold">{mascot.name} is catching her breath</h3>
            <button type="button" data-autofocus onClick={() => gameRef.current?.togglePause(false)} className="mt-5 rounded-md bg-accent-fill px-5 py-2 font-mono text-sm font-semibold uppercase tracking-widest text-accent-ink">
              ▶ Resume
            </button>
          </Overlay>
        )}

        {screen === "over" && result && (
          <Overlay>
            <p className="hud-label text-accent">Run complete · reached {result.level}</p>
            <p className="mt-1 text-5xl font-semibold tabular">{result.score}</p>
            <p className="text-sm text-muted">{result.score >= best && result.score > 0 ? "New high score! 🐾" : `High score: ${best}`}</p>
            <dl className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-2 font-mono text-xs">
              <Stat k="Distance" v={`${result.metres} m`} />
              <Stat k="Best combo" v={`×${result.bestCombo}`} />
              <Stat k="Skills" v={result.caught.length} />
            </dl>
            {skillsCaught.length > 0 && (
              <ul className="mx-auto mt-3 flex max-w-md flex-wrap justify-center gap-1.5" aria-label="Skills collected">
                {skillsCaught.map((sk) => <li key={sk} className="rounded border border-line-strong px-2 py-0.5 font-mono text-xs">{sk}</li>)}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button type="button" data-autofocus onClick={start} className="rounded-md bg-accent-fill px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-accent-ink hover:brightness-110">↻ Play again</button>
              <button type="button" onClick={seeSkills} className="rounded-md border border-line-strong px-4 py-2 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent">See my real skills</button>
              <a href={profile.resume} download className="rounded-md border border-line-strong px-4 py-2 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent">↓ Download resume</a>
            </div>
          </Overlay>
        )}
      </div>
    </Modal>
  );
}

function Overlay({ children }) {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-auto bg-panel/80 p-4 text-center backdrop-blur-[2px] sm:p-6">
      <div>{children}</div>
    </div>
  );
}
function Chip({ children, accent }) {
  return <span className={`rounded px-2 py-1 ${accent ? "bg-[#ffb224] text-[#14110a]" : "bg-black/45 text-white"}`}>{children}</span>;
}
function Stat({ k, v }) {
  return (
    <div className="rounded border border-line bg-panel-2 px-2 py-1.5">
      <dt className="text-[0.58rem] uppercase tracking-widest text-muted">{k}</dt>
      <dd className="tabular text-sm">{v}</dd>
    </div>
  );
}
function IconBtn({ label, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="grid h-9 w-9 place-items-center rounded-md border border-line-strong text-sm transition hover:border-accent">
      {children}
    </button>
  );
}
function Kbd({ children }) {
  return <kbd className="rounded border border-line-strong bg-panel-2 px-1.5 font-mono text-xs text-text">{children}</kbd>;
}
