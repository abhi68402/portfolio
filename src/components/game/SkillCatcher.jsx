import { useEffect, useRef, useState } from "react";
import { gameSkills, profile } from "../../data/content";
import { safeGet, safeSet } from "../../hooks/storage";
import { scrollToSection } from "../../hooks/scrollTo";
import Modal, { CloseButton } from "../ui/Modal";
import { createGame } from "./engine";

const ROUND = 30;
const BEST_KEY = "skillcatcher-best";

// The game window. It shows three screens over the same canvas:
//   intro → playing → over (results). The engine does the actual game.
export default function SkillCatcher({ onClose }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [screen, setScreen] = useState("intro");
  const [hud, setHud] = useState({ timeLeft: ROUND, score: 0 });
  const [result, setResult] = useState(null);
  const [best, setBest] = useState(() => Number(safeGet(BEST_KEY, 0)) || 0);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    let lastSec = ROUND, lastScore = 0;
    const game = createGame(canvasRef.current, {
      skills: gameSkills,
      duration: ROUND,
      // only re-render React when the visible numbers actually change
      onTick: ({ timeLeft, score }) => {
        const sec = Math.ceil(timeLeft);
        if (sec !== lastSec || score !== lastScore) {
          lastSec = sec; lastScore = score;
          setHud({ timeLeft: sec, score });
        }
      },
      onCatch: (name) => setAnnounce(`${name} caught`),
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
    return () => game.destroy();
  }, []);

  // Move keyboard focus to the main button of each screen (Launch / Play again).
  const overlayRef = useRef(null);
  useEffect(() => {
    if (screen !== "playing") overlayRef.current?.querySelector("[data-autofocus]")?.focus();
  }, [screen]);

  const start = () => {
    setResult(null);
    setHud({ timeLeft: ROUND, score: 0 });
    setScreen("playing");
    gameRef.current?.start();
  };

  const seeSkills = () => {
    onClose();
    setTimeout(() => scrollToSection("skills"), 250);
  };

  const unique = result ? [...new Set(result.caught)] : [];

  return (
    <Modal onClose={onClose} labelledBy="game-title" className="max-w-3xl">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h2 id="game-title" className="font-semibold">Skill Catcher</h2>
          <p className="hud-label text-[0.6rem]">Catch skills · dodge bugs · 30 s</p>
        </div>
        <div className="flex items-center gap-4 font-mono text-sm">
          <Stat label="Score" value={hud.score} accent />
          <Stat label="Time" value={`${hud.timeLeft}s`} />
          <Stat label="Best" value={best} hideOnMobile />
          <CloseButton onClick={onClose} label="Close game" />
        </div>
      </div>

      <div ref={overlayRef} className="relative h-[min(62vh,520px)] bg-panel">
        <canvas
          ref={canvasRef}
          className="h-full w-full touch-none select-none"
          aria-label="Game area. Move with arrow keys, A and D, mouse, or by dragging."
          role="img"
        />
        <p className="sr-only" aria-live="polite">{announce}</p>

        {screen === "intro" && (
          <Overlay>
            <p className="hud-label text-accent">Mission briefing</p>
            <h3 className="mt-2 text-2xl font-semibold">Catch my skills before they hit the ground</h3>
            <ul className="mx-auto mt-4 max-w-sm space-y-1.5 text-left text-sm text-muted">
              <li>▸ Move with <Kbd>←</Kbd> <Kbd>→</Kbd> or <Kbd>A</Kbd> <Kbd>D</Kbd>, the mouse, or drag on touch</li>
              <li>▸ Each skill is +1. Dashed <span className="text-text">✕ bug</span> capsules cost 2</li>
              <li>▸ You have 30 seconds. It gets faster</li>
            </ul>
            <button type="button" data-autofocus onClick={start} className="mt-6 rounded-md bg-accent-fill px-5 py-2.5 font-mono text-sm font-semibold uppercase tracking-widest text-accent-ink hover:brightness-110">
              ▶ Launch
            </button>
          </Overlay>
        )}

        {screen === "over" && result && (
          <Overlay>
            <p className="hud-label text-accent">Mission complete</p>
            <p className="mt-2 text-5xl font-semibold tabular">{result.score}</p>
            <p className="text-sm text-muted">
              {result.score >= best && result.score > 0 ? "New high score!" : `High score: ${best}`}
            </p>
            {unique.length > 0 && (
              <>
                <p className="hud-label mt-5 text-[0.62rem]">Skills caught ({result.caught.length})</p>
                <ul className="mx-auto mt-2 flex max-w-md flex-wrap justify-center gap-1.5">
                  {unique.map((s) => (
                    <li key={s} className="rounded border border-line-strong px-2 py-0.5 font-mono text-xs">{s}</li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button type="button" data-autofocus onClick={start} className="rounded-md bg-accent-fill px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-accent-ink hover:brightness-110">
                ↻ Play again
              </button>
              <button type="button" onClick={seeSkills} className="rounded-md border border-line-strong px-4 py-2 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent">
                See my real skills
              </button>
              <a href={profile.resume} download className="rounded-md border border-line-strong px-4 py-2 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent">
                ↓ Download resume
              </a>
            </div>
          </Overlay>
        )}
      </div>
    </Modal>
  );
}

function Overlay({ children }) {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-auto bg-panel/90 p-6 text-center backdrop-blur-sm">
      <div>{children}</div>
    </div>
  );
}

function Stat({ label, value, accent, hideOnMobile }) {
  return (
    <div className={`text-right ${hideOnMobile ? "hidden sm:block" : ""}`}>
      <div className="hud-label text-[0.55rem]">{label}</div>
      <div className={`tabular leading-none ${accent ? "text-accent" : ""}`}>{value}</div>
    </div>
  );
}

function Kbd({ children }) {
  return <kbd className="rounded border border-line-strong bg-panel-2 px-1.5 font-mono text-xs text-text">{children}</kbd>;
}
